const filterDesignMagnitude = document.querySelector('#filter-mag-response');
const filterDesignPhase = document.querySelector('#filter-phase-response');
const allPassPhase = document.getElementById('all-pass-phase-response');
const finalPhase = document.getElementById('final-filter-phase-response');
const checkList = document.getElementById('list1');
const zero_mode_btn = document.getElementById("zero");
// const open = document.getElementById('open');
// const modal_container = document.getElementsByClassName('modal-container');
// const close =document.getElementById('close');
const pole_mode_btn = document.getElementById("pole");
const modes_btns = [zero_mode_btn, pole_mode_btn];
document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff);
document.querySelector('#new-all-pass-coef').addEventListener('click', addNewA);


// open.addEventListener('click', ()=>{
//     modal_container.classList.add('visible');
// });
// close.addEventListener('click', ()=>{
//     modal_container.classList.remove('visible');
// });

clearCheckBoxes()
async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    return response.json()
}


async function updateFilterDesign(data) {
    data.gain = 1
    let { w, angels, magnitude } = await postData(`${API}/getFilter`, data)
    plotlyMultiLinePlot(filterDesignMagnitude, [
        { x: w, y: magnitude, line: { color: '#febc2c' } },
    ])
    plotlyMultiLinePlot(filterDesignPhase, [
        { x: w, y: angels, line: { color: '#fd413c' } },
    ])
}

checkList.getElementsByClassName('anchor')[0].onclick = function () {
    if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
    else
        checkList.classList.add('visible');
}



async function updateFilterPhase(allPassCoeff){
    const { zeros, poles } = filter_plane.getZerosPoles(radius)

    const { angels: allPassAngels } = await postData(
        'http://127.0.0.1:8080/getAllPassFilter',
        {
            a: allPassCoeff,
        }
    )

    const { w, angels: finalFilterPhase } = await postData(
        'http://127.0.0.1:8080/getFinalFilter',
        {
            zeros,
            poles,
            a: allPassCoeff,
        }
    )
    updateFilterPlotting(w,  allPassAngels, finalFilterPhase)
}

function updateFilterPlotting(w,  allPassAngels, finalFilterPhase){
    plotlyMultiLinePlot(allPassPhase, [{x: w, y: allPassAngels}])
    plotlyMultiLinePlot(finalPhase, [{x: w, y: finalFilterPhase}])
}

function plotlyMultiLinePlot(container, data){
    Plotly.newPlot(
        container,
        data,
        {
            margin: { l: 30, r: 0, b: 30, t: 0 },
            xaxis: {
                autorange: true,
                tickfont: { color: '#000000' },
            },
            yaxis: {
                autorange: true,
                tickfont: { color: '#000000' },
            },
            plot_bgcolor: '#cccccc',
            paper_bgcolor: '#cccccc',
        },
        { staticPlot: true }
    )
}

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value
    })
}

function updateAllPassCoeff(){
    let allPassCoeff = []
    document.querySelectorAll('.target1').forEach(item => {
        let aValue = parseFloat(item.dataset.avalue)
        let checked = item.checked
        if (checked) allPassCoeff.push(aValue)
    })
    updateFilterPhase(allPassCoeff)
}

function clearCheckBoxes(){
    document.querySelectorAll('.target1').forEach(item => {
        item.checked = false;
    })
}

function changeMode(e){
    unit_circle_mode = modesMap[e.target.id]
    for(btn of modes_btns){
        btn.style.color = (btn !== e.target) ? "#fff" : "#febc2c";
    }
}
