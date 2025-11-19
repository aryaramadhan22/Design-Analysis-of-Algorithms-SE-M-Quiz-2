// ================= GRAPH DATA ===================
const graphData = {
    nodes: {
        A:{x:100,y:250,name:"Kota A"}, B:{x:250,y:100,name:"Kota B"},
        C:{x:250,y:400,name:"Kota C"}, D:{x:400,y:250,name:"Kota D"},
        E:{x:550,y:100,name:"Kota E"}, F:{x:550,y:400,name:"Kota F"},
        G:{x:700,y:250,name:"Kota G"}
    },
    edges:[
        {from:"A",to:"B",weight:4},{from:"A",to:"C",weight:2},
        {from:"B",to:"C",weight:1},{from:"B",to:"D",weight:5},
        {from:"C",to:"D",weight:8},{from:"C",to:"F",weight:10},
        {from:"D",to:"E",weight:3},{from:"D",to:"F",weight:2},
        {from:"E",to:"G",weight:1},{from:"F",to:"G",weight:4}
    ]
};

// ================= UTILITY FUNCTIONS ===============
const buildAdj = () => {
    const adj = {};
    Object.keys(graphData.nodes).forEach(n => adj[n] = []);
    graphData.edges.forEach(e => {
        adj[e.from].push({ node: e.to, weight: e.weight });
        adj[e.to].push({ node: e.from, weight: e.weight });
    });
    return adj;
};

const isConnected = (adj, s, t) => {
    const st=[s], v=new Set();
    while(st.length){
        const x=st.pop();
        if(x===t) return true;
        if(!v.has(x)){
            v.add(x);
            adj[x].forEach(n=>st.push(n.node));
        }
    }
    return false;
};

// ================ DIJKSTRA WITH STEPS ================
function dijkstraSteps(adj,start,end){
    const steps=[],dist={},prev={},pq=[],vis=new Set();
    Object.keys(adj).forEach(n=>{ dist[n]=Infinity; prev[n]=null; });
    dist[start]=0; pq.push({node:start,distance:0});

    steps.push({type:"init",current:start,distances:{...dist},visited:new Set(),message:`Mulai dari ${start}`});

    while(pq.length){
        pq.sort((a,b)=>a.distance-b.distance);
        const {node:cur, distance:d} = pq.shift();
        if(vis.has(cur)) continue;
        vis.add(cur);

        steps.push({type:"visiting",current:cur,distances:{...dist},visited:new Set(vis),message:`Mengunjungi ${cur}`});
        if(cur===end) break;

        adj[cur].forEach(nb=>{
            if(!vis.has(nb.node)){
                const nd = dist[cur] + nb.weight;
                if(nd < dist[nb.node]){
                    dist[nb.node]=nd; prev[nb.node]=cur;
                    pq.push({node:nb.node,distance:nd});
                    steps.push({type:"update",current:cur,neighbor:nb.node,distances:{...dist},visited:new Set(vis),message:`Update ${nb.node} = ${nd}`});
                }
            }
        });
    }

    const path=[]; let c=end;
    while(c) { path.unshift(c); c=prev[c]; }
    steps.push({type:"complete",path,distance:dist[end],distances:{...dist},visited:new Set(vis),message:`Selesai!`});
    return steps;
}

// ================== CANVAS SETUP =====================
const canvas=document.getElementById("graphCanvas");
const ctx=canvas.getContext("2d");

function resizeCanvas(){
    const size=Math.min(canvas.parentElement.clientWidth,800);
    canvas.width=size; canvas.height=size*0.625;
}
resizeCanvas(); window.addEventListener("resize",()=>{resizeCanvas();draw();});

// ============= DRAW HELPERS ==================
const getNodeColors=(step,id)=>{
    if(!step) return ["#007bff","#0056b3"];
    if(step.type==="complete" && step.path?.includes(id)) return ["#dc3545","#c82333"];
    if(step.current===id) return ["#ffc107","#e0a800"];
    if(step.visited?.has?.(id)) return ["#28a745","#1e7e34"];
    return ["#007bff","#0056b3"];
};

const drawEdge=(e,step,sx,sy)=>{
    const A=graphData.nodes[e.from], B=graphData.nodes[e.to];
    const x1=A.x*sx, y1=A.y*sy, x2=B.x*sx, y2=B.y*sy;

    const onPath = (step?.type==="complete") && step.path?.includes(e.from) && step.path?.includes(e.to) &&
                   Math.abs(step.path.indexOf(e.from)-step.path.indexOf(e.to))===1;

    ctx.strokeStyle = onPath ? "#dc3545" : "#e5e7eb";
    ctx.lineWidth   = onPath ? 4 : 2;

    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();

    // weight label
    const mx=(x1+x2)/2, my=(y1+y2)/2;
    ctx.fillStyle="#495057";
    ctx.fillRect(mx-12,my-12,24,24);
    ctx.fillStyle="#fff"; ctx.textAlign="center";
    ctx.fillText(e.weight,mx,my);
};

const drawNode=(id,node,step,sx,sy)=>{
    const x=node.x*sx, y=node.y*sy;
    const [fill,stroke]=getNodeColors(step,id);

    ctx.beginPath(); ctx.arc(x,y,25,0,Math.PI*2);
    ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=3; ctx.stroke();

    ctx.fillStyle="#fff"; ctx.font="bold 18px sans-serif"; ctx.textAlign="center";
    ctx.fillText(id,x,y);

    ctx.fillStyle="#212529"; ctx.font="13px sans-serif";
    ctx.fillText(node.name,x,y+40);

    // SAFE optional chaining for distances
    if(step?.distances?.[id] !== undefined && step.distances?.[id] !== Infinity){
        ctx.fillStyle="#6f42c1"; ctx.font="bold 12px sans-serif";
        ctx.fillText(`d:${step.distances[id]}`,x,y-35);
    }
};

// ================= DRAW GRAPH =================
let currentStep=null;

function draw(){
    // guard if ctx missing
    if(!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const sx = canvas.width/800, sy = canvas.height/500;

    graphData.edges.forEach(e=>drawEdge(e,currentStep,sx,sy));
    Object.entries(graphData.nodes).forEach(([id,n])=>drawNode(id,n,currentStep,sx,sy));
}

draw();

// ================= ANIMATION ======================
let steps=[], stepIndex=0, isRunning=false, timeout=null;

const startBtn=document.getElementById("startBtn");
const resetBtn=document.getElementById("resetBtn");
const startCity=document.getElementById("startCity");
const endCity=document.getElementById("endCity");
const statusContainer=document.getElementById("statusContainer");

function updateStatus(s){
    if(!s){
        statusContainer.innerHTML=`<p class='text-muted'><i class='bi bi-hand-index me-2'></i>Pilih kota untuk memulai.</p>`;
        return;
    }
    const base = `
        <div class="status-box">
            <strong><i class="bi bi-info-circle me-2"></i>${s.message}</strong>
            <div class="mt-2 small text-muted">Step ${stepIndex+1} / ${steps.length}</div>
        </div>
    `;
    const spin = (isRunning && s.type !== "complete") ? `
        <div class="d-flex align-items-center text-primary mt-2">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div> Proses...
        </div>` : "";

    const done = s.type==="complete" ? `
        <div class="result-box">
            <h5><i class="bi bi-check-circle-fill me-2"></i>Rute Ditemukan!</h5>
            <p><strong>Jalur:</strong> ${s.path.join(" → ")}</p>
            <p><strong>Total Jarak:</strong> <span class="badge bg-success fs-6">${s.distance}</span></p>
        </div>` : "";

    statusContainer.innerHTML = base + spin + done;
}

function animate(){
    if(stepIndex < steps.length){
        currentStep=steps[stepIndex];
        draw(); updateStatus(currentStep);
        stepIndex++;

        if(stepIndex < steps.length){
            timeout=setTimeout(animate,1000);
        } else {
            isRunning=false;
            startBtn.disabled=false; startCity.disabled=false; endCity.disabled=false;
        }
    }
}

// =============== EVENT: START ==================
startBtn.addEventListener("click",()=>{
    const s=startCity.value, t=endCity.value;
    if(s===t) return alert("Kota tidak boleh sama!");

    const adj=buildAdj();
    if(!isConnected(adj,s,t)) return alert("Tidak ada rute!");

    steps=dijkstraSteps(adj,s,t);
    stepIndex=0; isRunning=true;

    startBtn.disabled=true; startCity.disabled=true; endCity.disabled=true;
    animate();
});

// =============== EVENT: RESET ==================
resetBtn.addEventListener("click",()=>{
    clearTimeout(timeout);
    isRunning=false; steps=[]; stepIndex=0; currentStep=null;

    startBtn.disabled=false; startCity.disabled=false; endCity.disabled=false;
    draw(); updateStatus(null);
});
