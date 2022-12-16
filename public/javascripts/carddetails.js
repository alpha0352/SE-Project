function cardspace() {
    var carddigit = document.getElementById('cardno').value;
    if (carddigit.length == 4 || carddigit.length == 9 || carddigit.length == 14) {
        document.getElementById('cardno').value = carddigit + ' ';
        document.getElementById('cardno').max = 1;
    }
}

function addSlashes() {
    var expire_date = document.getElementById('validtill').value;
    if (expire_date.length == 2) {
        document.getElementById('validtill').value = expire_date + '/';
        document.getElementById('validtill').max = 1;
    }
}

function btnclicked() {
    var obj;

    fetch('/users/tktdet', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        .then(data => {
            obj = data;
        })
        .then(() => {
            if (obj.length > 1) {
                fetch('/users/checkout', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            bucketitems: [{
                                    id: JSON.parse(obj[0].flightno),
                                    quantity: JSON.parse(obj[0].qty)
                                },
                                {
                                    id: JSON.parse(obj[1].flightno),
                                    quantity: JSON.parse(obj[1].qty)
                                },
                            ]
                        }),
                    })
                    .then(res => {
                        if (res.ok) return res.json()
                        return res.json().then(json => Promise.reject(json))
                    }).then(({
                        url
                    }) => {
                        window.location = url
                    }).catch(e => {
                        console.error(e.error)
                    })
            }
            else{
                fetch('/users/checkout', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            bucketitems: [{
                                    id: JSON.parse(obj[0].flightno),
                                    quantity: JSON.parse(obj[0].qty)
                                }
                            ]
                        }),
                    })
                    .then(res => {
                        if (res.ok) return res.json()
                        return res.json().then(json => Promise.reject(json))
                    }).then(({
                        url
                    }) => {
                        window.location = url
                    }).catch(e => {
                        console.error(e.error)
                    })
            }

        });

}