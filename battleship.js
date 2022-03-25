document.addEventListener('DOMContentLoaded', () => {
	const userGrid = document.querySelector('.grid-user .grid-field');
	const computerGrid = document.querySelector('.grid-computer .grid-field');
	const shipsContainer = document.querySelector('.ships-container');
	const ships = document.querySelectorAll('.ships-container .ship');
	const patrol = document.querySelectorAll('.ships-container .patrol');
	const destroyer = document.querySelectorAll('.ships-container .destroyer');
	const submarine = document.querySelectorAll('.ships-container .submarine');
	const cruiser = document.querySelector('.ships-container .cruiser');
	const status = document.querySelector('.status');
	const startContainer = document.querySelector('.start-game');
	const startBtn = document.querySelector('.start-btn');
	const messageBox = document.querySelector('.message');
	const userSquares = [];
	const computerSquares = [];
	const boardWidth = 10;
	const shipList = [3,2,2,1,1,1,0,0,0,0];
	let selectedShipIndex;
	let draggedShip;
	let draggedShipClasses;
	let draggedShipLength;
	let emprtyShipContainer;
	let shipCount = 0;
	let cpuShipCount = 0;
	const refrestBtn = document.createElement('input');
	let currentPlayer = 'user';
	let isGameOver = false;
	let userShipSquareArray = [];

	let createBoard = (grid, squares) => {
		for (let i = 0; i < boardWidth*boardWidth; i++) {
			const square = document.createElement('div');

			square.dataset.id = i;
			grid.appendChild(square);
			squares.push(square);
			userShipSquareArray.push(i);
		}
	};
	createBoard(userGrid, userSquares);
	createBoard(computerGrid, computerSquares);
	userShipSquareArray = [...new Set(userShipSquareArray)];

	const shipArray = [
		{
			name: 'patrol',
			directions: [
				[0]
			]
		},
		{
			name: 'destroyer',
			directions: [
				[0, 1],
				[0, boardWidth]
			]
		},
		{
			name: 'submarine',
			directions: [
				[0, 1, 2],
				[0, boardWidth, boardWidth*2]
			]
		},
		{
			name: 'cruiser',
			directions: [
				[0, 1, 2, 3],
				[0, boardWidth, boardWidth*2, boardWidth*3]
			]
		}
	];

	let generate = (ship) => {
		let randomDirection = Math.floor(Math.random() * ship.directions.length);
		let currentShipDirection = ship.directions[randomDirection];
		let shipCoordinates = [];
		let siblinsSquares = [];

		if (randomDirection === 0) {
			direction = 1;
		} else {
			direction = 10;
		}

		let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)));

		currentShipDirection.forEach(index => shipCoordinates.push(randomStart + index));
		siblinsSquares = markSiblingElements(shipCoordinates);

		const isTaken = shipCoordinates.some(index => computerSquares[index].classList.contains('taken'));

		if (!isTaken && randomDirection === 0) {
			switch (true) {
				case (ship.directions[0].length === 4 && !(randomStart%boardWidth >= 7)):
				case (ship.directions[0].length === 3 && !(randomStart%boardWidth >= 8)):
				case (ship.directions[0].length === 2 && !(randomStart%boardWidth >= 9)):
				case (ship.name === 'patrol'):
					shipCoordinates.forEach(index => computerSquares[index].classList.add('ship', 'taken', ship.name));
					siblinsSquares.forEach(index => computerSquares[index].classList.add('taken'));
				break;
				default:
					generate(ship);
				break;
			}
		} else if (!isTaken && randomDirection === 1) {
			shipCoordinates.forEach(index => computerSquares[index].classList.add('ship', 'taken', ship.name));
			siblinsSquares.forEach(index => computerSquares[index].classList.add('taken'));
		} else {
			generate(ship);
		}
	};
	shipList.forEach(index => generate(shipArray[index]));

	const rotateShip = (ship) => {
		ship.forEach(elem => {
			elem.classList.toggle('horizontal');
		});
	};

	destroyer.forEach(item => {
		item.addEventListener('click', function(){
			rotateShip(destroyer);
		});
	});

	submarine.forEach(item => {
		item.addEventListener('click', function(){
			rotateShip(submarine);
		});
	});

	cruiser.addEventListener('click', function(){
		this.classList.toggle('horizontal');
	});

	ships.forEach(ship => ship.addEventListener('dragstart', dragStart));
	userSquares.forEach(square => square.addEventListener('dragstart', dragStart));
	userSquares.forEach(square => square.addEventListener('dragover', dragOver));
	userSquares.forEach(square => square.addEventListener('dragenter', dragEnter));
	userSquares.forEach(square => square.addEventListener('drop', dragDrop));

	ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
		selectedShipIndex = +e.target.getAttribute('deck-id');
	}));

	function dragStart () {
		draggedShip = this;
		draggedShipClass = this.classList[1];
		draggedShipLength = +this.childNodes.length;
	}

	function dragOver (e) {
		e.preventDefault();
	}

	function dragEnter (e) {
		e.preventDefault();
	}

	function dragDrop () {
		let isHorizontal = draggedShip.classList.contains('horizontal');
		let shipFirstSquareId, shipLastSquareId;
		let draggedShipCoordinates = [];
		let draggedSiblinsSquares = [];

		if (isHorizontal || draggedShipLength === 1) {
			shipFirstSquareId = +this.dataset.id - selectedShipIndex;
			shipLastSquareId = shipFirstSquareId + draggedShipLength - 1;

			switch (true) {
				case (draggedShipLength === 4 && !(shipFirstSquareId%boardWidth >= 7)):
				case (draggedShipLength === 3 && !(shipFirstSquareId%boardWidth >= 8)):
				case (draggedShipLength === 2 && !(shipFirstSquareId%boardWidth >= 9)):
				case (draggedShipLength === 1):
				if((userSquares[shipFirstSquareId].classList.contains('taken')) || (userSquares[shipLastSquareId].classList.contains('taken'))) {
					alert('Слишком плотно! Нужно сменить позицию корабля.');
				} else {
					for(let i=0; i < draggedShipLength; i++){
						userSquares[shipFirstSquareId + i].classList.add('ship', 'taken', draggedShipClass);
						draggedShipCoordinates.push(shipFirstSquareId + i);
					}

					draggedSiblinsSquares = markSiblingElements(draggedShipCoordinates);
					draggedSiblinsSquares.forEach(index => userSquares[index].classList.add('taken'));


					shipsContainer.removeChild(draggedShip);
				}
				break;
				default:
				alert('Выходим за поля! Нужно сменить позицию корабля.');
				break;
			}
		} else if (!isHorizontal) {
			shipFirstSquareId = +this.dataset.id - selectedShipIndex*boardWidth;
			shipLastSquareId = shipFirstSquareId + (draggedShipLength - 1)*boardWidth;

			switch (true) {
				case (draggedShipLength === 4 && shipFirstSquareId <= 69 && shipFirstSquareId >= 0):
				case (draggedShipLength === 3 && shipFirstSquareId <= 79 && shipFirstSquareId >= 0):
				case (draggedShipLength === 2 && shipFirstSquareId <= 89 && shipFirstSquareId >= 0):
				if((userSquares[shipFirstSquareId].classList.contains('taken')) || (userSquares[shipLastSquareId].classList.contains('taken'))) {
					alert('Слишком плотно! Нужно сменить позицию корабля.');
				} else {
					for(let i=0; i < draggedShipLength; i++){
						userSquares[shipFirstSquareId + boardWidth*i].classList.add('ship', 'taken', draggedShipClass);
						draggedShipCoordinates.push(shipFirstSquareId + boardWidth*i);
					}

					draggedSiblinsSquares = markSiblingElements(draggedShipCoordinates);
					draggedSiblinsSquares.forEach(index => userSquares[index].classList.add('taken'));

					shipsContainer.removeChild(draggedShip);
				}
				break;
				default:
				alert('Выходим за поля! Нужно сменить позицию корабля.');
				break;
			}
		}

		if(!shipsContainer.querySelectorAll(".ship").length){
			startContainer.classList.add('show');
			shipsContainer.remove();
			messageBox.innerHTML = '';
		}
	}

	function playGame() {
		if(isGameOver) return;
		if (currentPlayer === 'user') {
			status.innerHTML = 'Ваш ход!'
			computerSquares.forEach(square => square.addEventListener('click', function(e) {
				if(square.classList.contains('miss') || square.classList.contains('boom')){
					alert('Здесь ничего нет, уже стреляли!');
				} else {
					revealSquare(square);
				}
			}));
		}
		if (currentPlayer === 'computer') {
			messageBox.innerHTML = '';
			status.innerHTML = 'Ход соперника!'
			setTimeout(computerGo, 500);
			computerGrid.classList.add('closed');
		}
	}

	startBtn.addEventListener('click', () => {
		startContainer.classList.remove('show');
		playGame();
	});

	let patrolCount = 0;
	let destroyerCount = 0;
	let submarineCount = 0;
	let cruiserCount = 0;

	function revealSquare(square) {
		if(!square.classList.contains('boom')){
			if(square.classList.contains('ship')) {
				if (square.classList.contains('destroyer')) destroyerCount++;
				if (square.classList.contains('submarine')) submarineCount++;
				if (square.classList.contains('cruiser')) cruiserCount++;
				if (square.classList.contains('patrol') || (square.classList.contains('destroyer') && destroyerCount%2 === 0) || (square.classList.contains('submarine') && submarineCount%3 === 0) || (square.classList.contains('cruiser') && cruiserCount%4 === 0)) {
					alert('Убил!');
				} else {
					alert('Попадание, ранил!');
				}

				shipCount++;
			}
		}

		if(square.classList.contains('ship')){
			square.classList.add('boom');
		} else {
			square.classList.add('miss');
		}

		winCheck();
		currentPlayer = 'computer';
		playGame();
	}

	let potential = [];
	let hits = [];
	let random;
	let patrolCountComp = 0;
	let destroyerCountComp = 0;
	let submarineCountComp = 0;
	let cruiserCountComp = 0;

	function computerGo() {
		if (!potential.length){
			random = userShipSquareArray[Math.floor(Math.random() * userShipSquareArray.length)];
		} else {
			random = potential[Math.floor(Math.random() * potential.length)];
		}

		if(!userSquares[random].classList.contains('boom') && !userSquares[random].classList.contains('miss')){
			if(userSquares[random].classList.contains('ship')){
				userSquares[random].classList.add('boom');
				addPotentialHits(random);

				if (userSquares[random].classList.contains('destroyer')) destroyerCountComp++;
				if (userSquares[random].classList.contains('submarine')) submarineCountComp++;
				if (userSquares[random].classList.contains('cruiser')) cruiserCountComp++;

				cpuShipCount++;
			} else {
				userSquares[random].classList.add('miss');
			}

			if(potential.length){
				removePotentialHits(random);
			}
		} else {
			computerGo();
		}

		if (cruiserCountComp === 4 || submarineCountComp === 3 || destroyerCountComp === 2 || userSquares[random].classList.contains('patrol')){
			let marked = markSiblingElements(hits);

			marked.forEach(function(elem){
				if(userShipSquareArray.includes(elem)){
					return userShipSquareArray.splice(userShipSquareArray.indexOf(elem),1);
				}
			});

			hits = [];
			potential = [];
			cruiserCountComp = 0;
			submarineCountComp = 0;
			destroyerCountComp = 0;
		}

		if(cpuShipCount === 20){
			winCheck();
		} else {
			currentPlayer = 'user';
			status.innerHTML = 'Ваш ход!';
			computerGrid.classList.remove('closed');
		}
	}

	function addPotentialHits(randomhit){
		hits.push(randomhit);

		if(!potential.length){
			potential.push(randomhit - 1, randomhit + 1, randomhit - 10, randomhit + 10);
		} else {
			if(randomhit-hits[0] === -1 || randomhit-hits[0] === -2 ){
				potential.push(randomhit - 1);
			} else if(randomhit-hits[0] === 1 || randomhit-hits[0] === 2) {
				potential.push(randomhit + 1);
			} else if(randomhit-hits[0] === -10 || randomhit-hits[0] === -20){
				potential.push(randomhit - 10);
			} else if(randomhit-hits[0] === 10 || randomhit-hits[0] === 20) {
				potential.push(randomhit + 10);
			}
		}

		potential = potential.filter(index => compareSibling(index, randomhit, randomhit));
	}

	function removePotentialHits(randomhit){
		if(hits.length >= 2){
			for(let i = 0; i < potential.length; i++){
				if (potential[i] === randomhit || ((potential[i]%10 === hits[0]%10) && Math.abs(randomhit-hits[0]) <= 2) || (Math.abs(randomhit-hits[0]) === 10) && Math.abs(potential[i]-hits[0]) === 1) {
					potential[i] = null;
				}
			}
		} else {
			for(let i = 0; i < potential.length; i++){
				if (potential[i] === randomhit) {
					potential.splice(i, 1);
				}
			}
		}

		potential = potential.filter(function(item) {
			return item != null;
		});
	}

	function markSiblingElements(array){
		let markArray = [];
		array.sort();

		for(let i = 0; i < array.length; i++){
			markArray.push(array[i]-11, array[i]-10, array[i]-9, array[i]-1, array[i]+1, array[i]+9, array[i]+10, array[i]+11);
		}

		markArray = [...new Set(markArray)].sort();
		markArray = markArray.filter(index => compareSibling(index, array[0], array[array.length-1]));

		return markArray;
	}

	function compareSibling (item, elem1, elem2) {
		if(item >= 0 && item < 100){
			if(elem1%10 === 0){
				return item%10 != 9;
			} else if(elem2%10 === 9){
				return item%10 != 0;
			} else {
				return true;
			}
		}
	}

	function winCheck() {
		if(shipCount === 20){
			status.innerHTML = '<span>Вы выиграли</span>';
			gameOver();
		}
		if(cpuShipCount === 20){
			status.innerHTML = '<span>Соперник выиграл!</span>';
			gameOver();
		}

		refrestBtn.setAttribute('type', 'button');
		refrestBtn.setAttribute('value', 'Ещё один бой!');
		refrestBtn.setAttribute('class', 'refresh btn');
		status.appendChild(refrestBtn);
		computerGrid.classList.add('closed');
	}

	refrestBtn.addEventListener('click', () => {
		document.location.reload();
	});

	function gameOver() {
		isGameOver = true;
		startBtn.removeEventListener('click', playGame);
	}
});
