const tableBody = document.getElementById('taskTableBody');
const names = ['None', 'Vedant', 'Vishwa', 'Saumya', 'Virti', 'Jiya', 'Nishit', 'Mohisha', 'Aaryan', 'Manu', 'Rishabh', 'Tanvi', 'Other'];

let data;
fetch('https://splendid-pear-stockings.cyclic.app/getAllData')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(received_data => {
        data = received_data;
        const n = data.length;
        createTable(n);
        updateCellColors();

        tableBody.addEventListener('change', updateCellColors);

        const imageModal = document.getElementById('imageModal');
        const close = document.getElementsByClassName('close')[0];

        close.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
        tableBody.addEventListener('change', (event) => {
            const target = event.target;
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
                logUpdatedRow(target);
            }
        });
        function logUpdatedRow(updatedElement) {
            const row = updatedElement.closest('tr');
            const cells = row.querySelectorAll('td');
        
            const rowIndex = Array.from(row.parentNode.children).indexOf(row);
            const updatedValue = (updatedElement.tagName === 'SELECT') ? updatedElement.value : updatedElement.value.trim();
        
            // Update the 'answer' or 'worked_on' property in the data array
            if (updatedElement === cells[2].querySelector('select')) {
                data[rowIndex].worked_on = updatedValue;
            } else if (updatedElement === cells[3].querySelector('input[type="text"]')) {
                data[rowIndex].answer = updatedValue;
            }
        
            new_data = {
                data: data[rowIndex],
                id: data[rowIndex]._id
            };
            fetch('https://splendid-pear-stockings.cyclic.app/insertData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(new_data)
            });
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function createTable(n) {
    for (let i = 0; i < n; i++) {
        const row = document.createElement('tr');

        const rowNumber = document.createElement('td');
        rowNumber.textContent = data[i]._id;
        row.appendChild(rowNumber);

        const photosColumn = document.createElement('td');
        const photoInput = document.createElement('input');
        photoInput.setAttribute('type', 'file');
        photoInput.setAttribute('accept', 'image/*');
        photoInput.setAttribute('multiple', true);

        const photosGrid = document.createElement('div');
        photosGrid.classList.add('photos-grid');

        if (data[i].images && data[i].images.length > 0) {
            data[i].images.forEach(imgLink => {
                const img = document.createElement('img');
                img.src = imgLink;

                img.addEventListener('click', function () {
                    document.getElementById('zoomedImage').src = img.src;
                    document.getElementById('imageModal').style.display = 'block';
                });

                photosGrid.appendChild(img);
            });
        }

        const removeAllPhotosBtn = document.createElement('button');
        removeAllPhotosBtn.innerHTML = '❌'; // Adding a cross as the button content
        removeAllPhotosBtn.addEventListener('click', function () {
            const imagesToRemove = photosGrid.querySelectorAll('img');
            imagesToRemove.forEach(img => {
                img.remove();
                const row = event.target.closest('tr'); 
                const rowIndex = Array.from(row.parentNode.children).indexOf(row);
                data[rowIndex].images = [];
                console.log(data[rowIndex]) 
                
                new_data = {
                    data: data[rowIndex],
                    id: data[rowIndex]._id
                };
                fetch('https://splendid-pear-stockings.cyclic.app/insertData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(new_data)
                });
            });
        });

        photoInput.addEventListener('change', function (event) {
            const existingImages = photosGrid.querySelectorAll('img');

            existingImages.forEach(img => {
                photosGrid.appendChild(img);
            });

            for (const file of event.target.files) {
                const formData = new FormData();
                formData.append('image', file);
        
                fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        Authorization: `Client-ID e9ed808930587f9`,
                    },
                    body: formData,
                })
                .then(response => response.json())
                .then(received_data => {
                    const uploadedImgLink = received_data.data.link;

                    const row = event.target.closest('tr'); 
                    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
                    data[rowIndex].images.push(uploadedImgLink);
                    console.log(data[rowIndex])
                    
                    const img = document.createElement('img');
                    img.src = uploadedImgLink;
                    
                    img.addEventListener('click', function () {
                        document.getElementById('zoomedImage').src = img.src;
                        document.getElementById('imageModal').style.display = 'block';
                    });
                    
                    photosGrid.appendChild(img);
                    new_data = {
                        data: data[rowIndex],
                        id: data[rowIndex]._id
                    };
                    fetch('https://splendid-pear-stockings.cyclic.app/insertData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(new_data)
                    });
                })
                .catch(error => {
                    console.error('Error uploading image to Imgur:', error);
                });
                // const reader = new FileReader();
                // reader.onload = function () {
                //     const img = document.createElement('img');
                //     img.src = reader.result;
                //     img.src = link;

                //     img.addEventListener('click', function () {
                //         document.getElementById('zoomedImage').src = img.src;
                //         document.getElementById('imageModal').style.display = 'block';
                //     });
                //     photosGrid.appendChild(img);
                // };
                // reader.readAsDataURL(file);
            }
        });

        const bttns = document.createElement('span');
        bttns.appendChild(removeAllPhotosBtn);
        bttns.appendChild(photoInput);

        // photosColumn.appendChild(photoInput);
        photosColumn.appendChild(bttns);
        photosColumn.appendChild(photosGrid);
        // photosColumn.appendChild(removeAllPhotosBtn); 
        
        const assignedToColumn = createDropdownColumn(names, data[i].worked_on);
        
        const answerColumn = document.createElement('td');
        const answerInput = document.createElement('input');
        answerInput.setAttribute('type', 'text');
        answerInput.value = data[i].answer;
        answerColumn.appendChild(answerInput);

        row.appendChild(photosColumn);
        row.appendChild(assignedToColumn);
        row.appendChild(answerColumn);

        tableBody.appendChild(row);
    }

    // Function to create a dropdown column
    function createDropdownColumn(options, defaultValue) {
        const column = document.createElement('td');
        const select = document.createElement('select');
    
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.text = option;
            select.appendChild(opt);
        });
    
        if (defaultValue) {
            select.value = defaultValue; // Set the default value
        }
    
        column.appendChild(select);
        return column;
    }    
}

function updateCellColors() {
    const tableRows = document.querySelectorAll('#taskTableBody tr');

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');

        if (cells.length >= 4) {
            const assignedToSelect = cells[2].querySelector('select');
            const answerInput = cells[3].querySelector('input');

            const assignedTo = assignedToSelect ? assignedToSelect.value : '';
            const answer = answerInput ? answerInput.value.trim() : '';

            background_color = 'white';
            if (assignedTo !== 'None') {
                background_color = 'lightyellow';
            }
            if (answerInput && answer.length > 0) {
                background_color = 'lightgreen';
            }

            row.style.backgroundColor = background_color;
        }
    });
}

