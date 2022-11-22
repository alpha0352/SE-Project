var reserve =
{
    init:()=>{
        let test=document.getElementsByClassName("cabin-fuselage")[0];
        for(let i=1;i<=10;i++)
        {
            let alpha = 65;
            const test2=document.createElement("div");
            test2.setAttribute("class",`row row-${i}`);
            const test3=document.createElement("div");
            test3.setAttribute("class","seats");
            test3.setAttribute("type","A");
            for(let j=65;j<=70;j++)
            {
                const seat = document.createElement("div");
                seat.innerHTML=i+String.fromCharCode(j);
                seat.className="seat";
                seat.onclick = () =>{reserve.toggle(seat);};
                test3.appendChild(seat);
            }
            test2.appendChild(test3);
            test.appendChild(test2);

        }
        console.log(test);
    },
    
    toggle : (seat) => {
        seat.classList.toggle("selected");
    },

    save : () =>{
        let selected = document.querySelectorAll("#plane .selected");
        let seats = [];
        for (let s of selected) { seats.push(s.innerHTML); }
        console.log(seats);

    }


    //const selected = document.querySelectorAll('.plane .seat input[type=checkbox]:checked + label');
    //console.log(selected);
}
window.addEventListener("DOMContentLoaded", reserve.init);