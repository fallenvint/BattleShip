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
	const userSquares = [];
	const computerSquares = [];
	const boardWidth = 10;
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
	

	let createBoard = (grid, squares) => {
		for (let i = 0; i < boardWidth*boardWidth; i++) {
			const square = document.createElement('div');

			square.dataset.id = i;
			grid.appendChild(square);
			squares.push(square);
		}
	};
	createBoard(userGrid, userSquares);
	createBoard(computerGrid, computerSquares);

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

		if (randomDirection === 0) direction = 1;
		if (randomDirection === 1) direction = 10;

		let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)));
		const isTaken = currentShipDirection.some(index => computerSquares[randomStart + index].classList.contains('taken'));
		let x1, x2, y1, y2;

		x1 = randomStart - 1;
		y1 = randomStart - boardWidth;

		if (randomDirection === 0) {
			x2 = randomStart + ship.directions[0].length;
			y2 = randomStart + boardWidth;
		}
		
		if (randomDirection === 1) {
			x2 = randomStart + 1;
			y2 = randomStart + boardWidth*ship.directions[0].length;
		}
		
		if (!isTaken && randomDirection === 0) {
			switch (true) {
				case (ship.directions[0].length === 4 && !(randomStart%boardWidth >= 7)):
				case (ship.directions[0].length === 3 && !(randomStart%boardWidth >= 8)):
				case (ship.directions[0].length === 2 && !(randomStart%boardWidth >= 9)):
				case (ship.name === 'patrol'):
				currentShipDirection.forEach(index => computerSquares[randomStart + index].classList.add('ship', 'taken', ship.name));

				if (y1 >= 0) currentShipDirection.forEach(index => computerSquares[y1 + index].classList.add('taken'));
				if (y2 <= computerSquares.length - 1) currentShipDirection.forEach(index => computerSquares[y2 + index].classList.add('taken'));

				if (x1 >= 0 && x1%10 != 9) {
					computerSquares[x1].classList.add('taken');

					if (x1-boardWidth >= 0) computerSquares[x1-boardWidth].classList.add('taken');
					if (x1+boardWidth <= computerSquares.length - 1) computerSquares[x1+boardWidth].classList.add('taken');
				}
				if (x2 <= computerSquares.length - 1 && x2%10 != 0) {
					computerSquares[x2].classList.add('taken');

					if (x2-boardWidth >= 0) computerSquares[x2-boardWidth].classList.add('taken');
					if (x2+boardWidth <= computerSquares.length - 1) computerSquares[x2+boardWidth].classList.add('taken');
				}
				break;
				default:
				generate(ship);
				break;
			}
		} else if (!isTaken && randomDirection === 1) {
			currentShipDirection.forEach(index => computerSquares[randomStart + index].classList.add('ship', 'taken', ship.name));

			if (x1 >= 0 && x1%10 != 9) currentShipDirection.forEach(index => computerSquares[x1 + index].classList.add('taken'));
			if (x2 <= computerSquares.length - 1 && x2%10 != 0) currentShipDirection.forEach(index => computerSquares[x2 + index].classList.add('taken'));

			if (y1 >= 0) {
				computerSquares[y1].classList.add('taken');

				if (y1%10 != 9) computerSquares[y1].nextSibling.classList.add('taken');
				if (y1%10 != 0) computerSquares[y1].previousSibling.classList.add('taken');
			} 
			if (y2 <= computerSquares.length - 1) {
				computerSquares[y2].classList.add('taken');

				if (y2%10 != 9) computerSquares[y2].nextSibling.classList.add('taken');
				if (y2%10 != 0) computerSquares[y2].previousSibling.classList.add('taken');
			}
		} else {
			generate(ship);
		}
	};
	generate(shipArray[3]);
	generate(shipArray[2]);
	generate(shipArray[2]);
	generate(shipArray[1]);
	generate(shipArray[1]);
	generate(shipArray[1]);
	generate(shipArray[0]);
	generate(shipArray[0]);
	generate(shipArray[0]);
	generate(shipArray[0]);

	let rotateShip = (ship) => {
		ship.forEach(elem => {
			elem.classList.toggle('horizontal');
		});
	}
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

		if (isHorizontal || draggedShipLength === 1) {
			let shipFirstSquareId = +this.dataset.id - selectedShipIndex;
			let shipLastSquareId = shipFirstSquareId + draggedShipLength - 1;

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

						if(shipFirstSquareId >= 0 && shipFirstSquareId <= 89) userSquares[shipFirstSquareId + boardWidth + i].classList.add('taken');
						if(shipFirstSquareId >= 10 && shipFirstSquareId <= 99) userSquares[shipFirstSquareId - boardWidth + i].classList.add('taken');
					}

					if ((shipFirstSquareId - 1) >= 0 && (shipFirstSquareId - 1)%10 != 9) {
						userSquares[shipFirstSquareId - 1].classList.add('taken');

						if ((shipFirstSquareId - 1) - boardWidth >= 0) userSquares[shipFirstSquareId - 1 - boardWidth].classList.add('taken');
						if ((shipFirstSquareId - 1) + boardWidth <= 99) userSquares[shipFirstSquareId - 1 + boardWidth].classList.add('taken');
					}
					if ((shipLastSquareId + 1) <= 99 && (shipLastSquareId + 1)%10 != 0) {
						userSquares[shipLastSquareId + 1].classList.add('taken');

						if ((shipLastSquareId + 1) - boardWidth >= 0) userSquares[shipLastSquareId + 1 - boardWidth].classList.add('taken');
						if ((shipLastSquareId + 1) + boardWidth <= 99) userSquares[shipLastSquareId + 1 + boardWidth].classList.add('taken');
					}

					shipsContainer.removeChild(draggedShip);
				}
				break;
				default:
				alert('Выходим за поля! Нужно сменить позицию корабля.');
				break;
			}
		} else if (!isHorizontal) {
			let shipFirstSquareId = +this.dataset.id - selectedShipIndex*boardWidth;
			let shipLastSquareId = shipFirstSquareId + (draggedShipLength - 1)*boardWidth;

			switch (true) {
				case (draggedShipLength === 4 && shipFirstSquareId <= 69 && shipFirstSquareId >= 0):
				case (draggedShipLength === 3 && shipFirstSquareId <= 79 && shipFirstSquareId >= 0):
				case (draggedShipLength === 2 && shipFirstSquareId <= 89 && shipFirstSquareId >= 0):
				if((userSquares[shipFirstSquareId].classList.contains('taken')) || (userSquares[shipLastSquareId].classList.contains('taken'))) {
					alert('Слишком плотно! Нужно сменить позицию корабля.');
				} else {
					for(let i=0; i < draggedShipLength; i++){
						userSquares[shipFirstSquareId + boardWidth*i].classList.add('ship', 'taken', draggedShipClass);

						if((shipFirstSquareId - 1) >= 0 && (shipFirstSquareId - 1)%10 != 9) userSquares[(shipFirstSquareId - 1) + boardWidth*i].classList.add('taken');
						if((shipFirstSquareId + 1) <= 89 && (shipFirstSquareId + 1)%10 != 0) userSquares[(shipFirstSquareId + 1) + boardWidth*i].classList.add('taken');
					}

					if ((shipFirstSquareId - boardWidth) >= 0) {
						userSquares[(shipFirstSquareId - boardWidth)].classList.add('taken');

						if (((shipFirstSquareId - boardWidth) - 1) >= 0 && ((shipFirstSquareId - boardWidth) - 1)%10 != 9 ) userSquares[((shipFirstSquareId - boardWidth) - 1)].classList.add('taken');
						if (((shipFirstSquareId - boardWidth) + 1)%10 != 0) {
							userSquares[((shipFirstSquareId - boardWidth) + 1)].classList.add('taken');
						} 
					}
					if ((shipLastSquareId + boardWidth) <= 99) {
						userSquares[(shipLastSquareId + boardWidth)].classList.add('taken');

						if (((shipLastSquareId + boardWidth) - 1) <= 99 && ((shipLastSquareId + boardWidth) - 1)%10 != 9 ) userSquares[((shipLastSquareId + boardWidth) - 1)].classList.add('taken');
						if (((shipLastSquareId + boardWidth) + 1)%10 != 0 && ((shipLastSquareId + boardWidth) - 1) <= 99 ) userSquares[((shipLastSquareId + boardWidth) + 1)].classList.add('taken');
					}

					shipsContainer.removeChild(draggedShip);
				}
				break;
				default:
				alert('Выходим за поля! Нужно сменить позицию корабля.');
				break;
			}
		}

		if(shipsContainer.querySelectorAll(".ship").length === 0){
			startContainer.classList.add('show');
		}
	}

	function playGame() {
		if(isGameOver) return;
		if (currentPlayer === 'user') {
			status.innerHTML = 'Ваш ход!'
			computerSquares.forEach(square => square.addEventListener('click', function(e) {
				revealSquare(square);
			}));
		}
		if (currentPlayer === 'computer') {
			status.innerHTML = 'Ход соперника!'
			setTimeout(computerGo, 1500);
			computerGrid.classList.add('closed');
		}
	}
	startBtn.addEventListener('click', () => {
		startContainer.classList.remove('show');
		playGame();
	});

	function revealSquare(square) {
		if(!square.classList.contains('boom')){
			if(square.classList.contains('ship')) shipCount++;
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

	function computerGo() {
		let random = Math.floor(Math.random() * userSquares.length);

		if(!userSquares[random].classList.contains('boom')){
			if(userSquares[random].classList.contains('ship')){
				userSquares[random].classList.add('boom');
			} else {
				userSquares[random].classList.add('miss');
			}

			if(userSquares[random].classList.contains('ship')) cpuShipCount++;
			winCheck();
		} else computerGo ();

		currentPlayer = 'user';
		status.innerHTML = 'Ваш ход!';
		computerGrid.classList.remove('closed');
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
