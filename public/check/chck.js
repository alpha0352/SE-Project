// let test=document.getElementsByClassName("cabin fuselage")[0];
let test = document.getElementById("cabin-fuselage");
for(let i=1;i<=10;i++)
{
    let alpha = 65;
    const test2=document.createElement("div");
    test2.setAttribute("class",`row row-${i}`);
    const test3=document.createElement("div");
    test3.setAttribute("class","seats");
    test3.setAttribute("type","A");
    for(let j=1;j<=6;j++)
    {
        const test4 = document.createElement("div");
        test4.setAttribute("class","seat");
        const itag=document.createElement("input");
        itag.setAttribute("type","checkbox");
        itag.setAttribute("id",`${i}${String.fromCharCode(alpha)}`);
        itag.setAttribute("name","seat");
        const lab=document.createElement("label");
        lab.textContent=`${i}${String.fromCharCode(alpha)}`;
        lab.setAttribute("for",`${i}${String.fromCharCode(alpha)}`);
        test4.appendChild(itag);
        test4.appendChild(lab);
        test3.appendChild(test4);
        alpha++;
    }
    test2.appendChild(test3);
    test.appendChild(test2);
    
}
console.log(test);

// let selected = document.querySelectorAll("input[type=checkbox]");
// addEventListener(onclick) => function(){

// }
// for(let s of selected){
//     if(s.checked){
//         console.log(s.value);
//     }
// }

// const divtag=document.querySelector('cabin-fuselage');
// divtag.addEventListener("onclick", (e) => {
//     console.log(e);
// })

// $('#cabin-fuselag').on('click', 'button', function(event) {
//     console.log($(this).text())
//   });

const selected = document.querySelector('#cabin-fuselage');        
        const radioButtons = document.querySelectorAll('input[name="seat"]:checked');
        selected.addEventListener("click",() => {
            let selectedSize;
            for (const radioButton of radioButtons) {
                if (radioButton.checked) {
                    selectedSize = radioButton.value;
                    break;
                    console.log(selectedSize);
                }
            }
            console.log(radioButtons);

        })
        // btn.addEventListener("click", () => {
        //     let selectedSize;
        //     for (const radioButton of radioButtons) {
        //         if (radioButton.checked) {
        //             selectedSize = radioButton.value;
        //             break;
        //         }
        //     }
        

//console.log(selected,radioButtons);
