var reserve =
{   
    // function random()    
    init:()=>{

        const xhr = new XMLHttpRequest();
        xhr.open('GET','/users/getbkdseats')
        xhr.onload  = () =>{
            data = JSON.parse(xhr.response);
           
        let test=document.getElementsByClassName("cabin-fuselage")[0];
        for(let i=1;i<=10;i++)
        {
            let alpha = 65;
            const test2=document.createElement("div");
            test2.setAttribute("class",`row row-${i}`);
            const test3=document.createElement("div");
            test3.setAttribute("class","seats");
            test3.setAttribute("name","seats");
            test3.setAttribute("type","A");
            for(let j=65;j<=70;j++)
            {
                let seat;
                seat = document.createElement("div");
                seat.innerHTML=i+String.fromCharCode(j);
                const checkSeat = obj => obj.seat === seat.innerHTML;
                if(data.data.some(checkSeat))
                {
                    seat.className="notavailable";
                }
                else
                {
                    seat.className="seat";
                    seat.onclick = () =>{reserve.toggle(seat);}
                }
                test3.appendChild(seat);
            }
            test2.appendChild(test3);
            test.appendChild(test2);

        }
        console.log(test);
    }
    xhr.send();
    
    },
    
    toggle : (seat) => {
        const xhr2 = new XMLHttpRequest();
        xhr2.open('GET','/users/getbkdseats')
        xhr2.onload  = () =>{
            resp = JSON.parse(xhr2.response);
            seat.classList.toggle("selected")
            slctedseat = document.getElementsByClassName("selected");
            if(slctedseat.length>resp.count[0].psngrcount){
                alert("You can only select "+ resp.count[0].psngrcount + " seats!");
                seat.classList.toggle("selected")
            }
        }
        xhr2.send();
    },

    save : () =>{
        let selected = document.querySelectorAll("#plane .selected");
        let seats = [];
        for (let s of selected) { seats.push(s.innerHTML); }
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST','/users/postseat');
        let seatstring = JSON.stringify(seats);
        xhr.send(seatstring);
        window.location = '/users/selectseat';
        
    }   

}
window.addEventListener("DOMContentLoaded", reserve.init);