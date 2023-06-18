const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2302-acc-et-web-pt-a';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(`${APIURL}players`);
        const data = await response.json();
        console.log(data.data.players);
        return data.data.players;


    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}players/${playerId}`);
        console.log(`${APIURL}players/${playerId}`)
        const returnData = await response.json();
        console.log(returnData.data.player)
        return returnData.data.player;

    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(APIURL + 'players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerObj)
        });
        const result = await response.json();
        return result;

    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL + `players/${playerId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
    try {
        let playerContainerHTML = '';

        playerList.forEach((player) => {
            const playerHTML = `
                <div class="player-card">
                    <div class="player-image-container">
                        <img class="player-image" src="${player.imageUrl}" alt="${player.name} Image">
                    </div>
                    <h3>${player.name}</h3>
                    <p><b>Breed:</b> ${player.breed}</p>
                    <p><b>Status:</b> ${player.status}</p>
                   
                    <div>
                        <button class="details-button" data-id="${player.id}">See Details</button>
                        <button class="delete-button" data-id="${player.id}">Remove from Roster</button>
                    </div>
                </div>
            `;
            playerContainerHTML += playerHTML;
        });

        playerContainer.innerHTML = playerContainerHTML;


    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};


/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 * 
 * <input type="text" id="status" name="status" required>
 */
const renderNewPlayerForm = () => {
    try {
        const formHTML = `
            <h3>Add a new player</h3>
            <form id="add-player-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
                <label for="breed">Breed:</label>
                <input type="text" id="breed" name="breed" required>
                <label for="status">Status:</label>
                <select name="status" id="status">
                    <option value="field">Field</option>
                    <option value="bench" selected>Bench</option>
                <select>
                <label for="imageUrl">Image URL:</label>
                <input type="text" id="imageUrl" name="imageUrl" required>
                <button type="submit">Add Player</button>
            </form>
        `;

        newPlayerFormContainer.innerHTML = formHTML;

        const addPlayerForm = document.getElementById('add-player-form');
        addPlayerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const name = form.name.value;
            const breed = form.breed.value;
            const status = form.status.value;
            const imageUrl = form.imageUrl.value;

            const newPlayer = {
                name,
                breed,
                status,
                imageUrl
            };

            await addNewPlayer(newPlayer);
            const players = await fetchAllPlayers();
            renderAllPlayers(players);

            form.reset();
        });

    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

/** Render single player by ID function grabs the single player ID, calls the
 * fetchsinglePlayer function and then renders it
 */
const renderSinglePlayerById = async (id) => {
    try {
        //fetch player using fetchSinglePlayer function
        const player = await fetchSinglePlayer(id);
        const players = await fetchAllPlayers();
        const teamMembers = players.filter(dataLog => dataLog.teamId === player.teamId)
        const playerDetailsElement = document.createElement('div');
        playerDetailsElement.classList.add('player-details');
        playerDetailsElement.innerHTML = `
                <h2>${player.name}</h2>
                <p><b>Breed:</b> ${player.breed}</p>
                <p><b>Status:</b> ${player.status}</p>
                <p><b>Team ID:</b> ${player.teamId}</p>
                <p><b>Cohort ID:</b> ${player.cohortId}</p>
                <h2>Team Members: </h2>
                ${teamMembers.map((teamMember) => `${teamMember.name}`).join(', ')}
                <button class="close-button">Close</button>
                `;
        playerContainer.appendChild(playerDetailsElement);
        // add event listener to close button
        const closeButton = playerDetailsElement.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            playerDetailsElement.remove();
        });


    } catch (err) {
        console.error('Cannot render single player', err);
    }

}

/**
 * /event listener for Details button. It listens for click event and then passes the id to the 
 * renderSinglePlayerById function
 */
playerContainer.addEventListener('click', async function (e) {
    if (e.target.matches('.details-button')) {
        console.log(" See details button!!!");
        const id = e.target.dataset.id;
        renderSinglePlayerById(id);
    }
})

/**
 * Evenet listener for Delete button. It listens for when the delete button is clicked and then
 * calls the  removePlayer function.
 */
//event listener for Delete button///////////////////////////////////////////////////////////////
playerContainer.addEventListener('click', async function (e) {
    if (e.target.matches('.delete-button')) {
        console.log("Delete button pressed!!!");
        const id = e.target.dataset.id;
        await removePlayer(id); //calling remove player function
        const players = await fetchAllPlayers();
        //console.log(players);
        renderAllPlayers(players);
    }
})

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();