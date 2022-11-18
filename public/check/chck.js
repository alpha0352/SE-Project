let test=document.getElementsByClassName("cabin fuselage")[0];
for(let i=1;i<=10;i++)
{
    let alpha = 65;
    const test2=document.createElement("li");
    test2.setAttribute("class",`row row-${i}`);
    const test3=document.createElement("ol");
    test3.setAttribute("class","seats");
    test3.setAttribute("type","A");
    for(let j=1;j<=6;j++)
    {
        const test4 = document.createElement("li");
        test4.setAttribute("class","seat");
        const itag=document.createElement("input");
        itag.setAttribute("type","checkbox");
        itag.setAttribute("id",`${i}${String.fromCharCode(alpha)}`);
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