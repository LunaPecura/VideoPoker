/* HELPER FUNCTIONS----------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
function getRandomInt(min, max) { // taken from MDN
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
} // END OF HELPER FUNCTION "getRandomInt()"
/*---------------------------------------------------------------------------------------*/
function stringToCamelCase(str) {
	let array = str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1));
	array[0] = array[0].toLowerCase();
	let camelCase = array.reduce((str1, str2) => str1 + str2);
	return camelCase;
} // END OF HELPER FUNCTION "stringToCamelCase()"
/*---------------------------------------------------------------------------------------*/



/* CLASSES-------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
class Card {
	rank = 0; // int between 2 and 14 (... 10, jacks, queen, king, ace)
	suit = 0; // int between 1 and 4 (clubs, diamonds, hearts, spades)

	constructor(rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}

	isRed() {
		return (this.suit === 2 || this.suit === 3);
	}

	toString() {
		let newString = "";

		switch(this.rank) {
			case 2: newString += "2"; break;
			case 3: newString += "3"; break;
			case 4: newString += "4"; break;
			case 5: newString += "5"; break;
			case 6: newString += "6"; break;
			case 7: newString += "7"; break;
			case 8: newString += "8"; break;
			case 9: newString += "9"; break;
			case 10: newString += "10"; break;
			case 11: newString += "J"; break;
			case 12: newString += "Q"; break;
			case 13: newString += "K"; break;
			case 14: newString += "A"; break;
			default: newString += "Error"; break;
		}

		switch(this.suit) {
			case 1: newString += "&clubsuit;"; break;
			case 2: newString += "&diamondsuit;"; break;
			case 3: newString += "&heartsuit;"; break;
			case 4: newString += "&spadesuit;"; break;
			default: newString += "Error"; break;
		}

		return newString;

	} // END OF METHOD "TOSTRING()"
} // END OF CLASS "Card"
/*---------------------------------------------------------------------------------------*/
class Hand {
	cards = [];

	addCard(card) {
		this.cards.push(card);
	}

	sortByRank() { // does not mutate original array 'cards'
		let sortedCards = [...this.cards];
		sortedCards.sort((card1, card2) => card1.rank - card2.rank);
		return sortedCards;
	}

	makeDiffArray() {
		let sortedCards = this.sortByRank();
		let diffArray = [];
		for(let i=0; i<4; i++) {
			diffArray.push(sortedCards[i+1].rank - sortedCards[i].rank);
		}
		return diffArray;
	}

	containsFlush() {
		let suits = this.cards.map((card) => card.suit);
		let result = suits.map(suit => suit === suits[0]).reduce((p,q) => p && q);
		return result;
	}

	determineResult() {
		let sortedCards = this.sortByRank();
		let diffArray = this.makeDiffArray();
		let result = "none";
		payout = 0; // global

		const numberOfOnes = diffArray.filter((element) => element === 1).length;
		const numberOfZeros = diffArray.filter((element) => element === 0).length;

		if(numberOfOnes === 4) {  // four 1s => straight
			result = "straight"; 
			payout = 4 ;
		} 

		switch(numberOfZeros) {
			case 3:
				if(diffArray[0] != 0 || diffArray[3] != 0) { 
					result = "four of a kind"; // three consecutive 0s => four of a kind
					payout = 25;
				} else {  // three non-consecutive 0s => full house
					result = "full house"; 
					payout = 9;
				} 
				break;
			case 2: 
				if(diffArray.lastIndexOf(0) - diffArray.indexOf(0) === 1) { // two consecutive 0s
					result = "three of a kind"; 
					payout = 3;
				} else { // two non-consecutive 0s
					result = "two pair"; 
					payout = 2;
				} 
				break;
			case 1: // singular 0
				if(sortedCards[diffArray.indexOf(0)].rank > 10) {
					result = "jacks or better";
					payout = 1;
				}
		}

		// check for flush & straight flush
		if(this.containsFlush()) {
			switch(result) {
				case "straight": result += " flush"; break;
				case "none": result = "flush"; break;
			}
		}

		// check for royal flush
		if(result === "straight flush") {
			if(sortedCards[4].rank === 14) {
				result = "royal flush";
			}
		}
	
		return result;

	} // END OF METHOD 'DETERMINE RESULT'
} // END OF CLASS "Hand"
/*---------------------------------------------------------------------------------------*/
class Deck {
	cards = [];

	constructor() {
		for(let suit = 1; suit <= 4; suit++) {
			for(let rank = 2; rank <= 14; rank++) {
				this.cards.push(new Card(rank, suit));
			}
		}
	}

	draw() {
		let randomInt = getRandomInt(1, this.cards.length);
		let randomCard = this.cards[randomInt-1];
		this.cards.splice(randomInt-1, 1)
		return randomCard;
	}

} // END OF CLASS "Deck"
/*---------------------------------------------------------------------------------------*/
class ButtonHandler {
	selector;
	handler;

	constructor(selector) {
		this.selector = selector;
		this.handler = document.querySelector(this.selector); 
	}

	enable() {
		this.handler.removeAttribute("disabled");
	}

	disable() {
		this.handler.setAttribute("disabled", true);
	}

	addClass(className) {
		this.handler.classList.add(className);
	}

	removeClass(className) {
		this.handler.classList.remove(className);
	}
} // END OF CLASS "ButtonHandler"
/*---------------------------------------------------------------------------------------*/
class DisplayHandler {
	selector;
	handler; 

	constructor(selector){
		this.selector = selector;
		this.handler = document.querySelector(this.selector);
	}

	updateContent(content) {
		this.handler.innerHTML = content;
	}

	addContent(content) {
		this.handler.innerHTML += content;
	}

	setFontColor(newColor) {
		(this.handler).style.color = newColor;
	}

	addClass(className) {
		this.handler.classList.add(className);
	}

	removeClass(className) {
		this.handler.classList.remove(className);
	}
} // END OF CLASS "DisplayHandler"
/*---------------------------------------------------------------------------------------*/
class Screen {

	// DISPLAY HANDLERS
	resultDisplay = new DisplayHandler(".display.result");
	roundDisplay = new DisplayHandler(".display.round");
	creditDisplay = new DisplayHandler(".display.credit");
	cardDisplays = [1,2,3,4,5].map(i => new DisplayHandler("#cardArea" + i));
	gameOverDisplay = new DisplayHandler(".gameOver");
	logDisplay = new DisplayHandler(".displayLog");


	// BUTTON HANDLERS
	newGameButton = new ButtonHandler(".actionButton.newGame");
	dealButton = new ButtonHandler(".actionButton.deal");
	drawButton = new ButtonHandler(".actionButton.draw");
	holdButtons = [1,2,3,4,5].map(i => new ButtonHandler("#holdButton" + i));
	autoRoundButton = new ButtonHandler(".actionButton.autoRound");
	autoGameButton = new ButtonHandler(".actionButton.autoGame");

	updateRound(n) {
		this.roundDisplay.updateContent("Round " + n.toString());
		this.roundDisplay.setFontColor("white");
	}

	setCredit(newCredit) {
		this.creditDisplay.updateContent("Credit: " + newCredit.toString());
		this.creditDisplay.setFontColor("white");
	}

	updateCredit(oldCredit, newCredit) {
		this.creditDisplay.updateContent("Credit: " + newCredit.toString() + 
			"   (+" + (newCredit-oldCredit).toString() + ")");
		if(newCredit === oldCredit) {
			this.creditDisplay.setFontColor("lightcoral");
		} else { this.creditDisplay.setFontColor("lightgreen"); }
	}

	updateResult(newResult) {
		this.resultDisplay.updateContent(newResult.toUpperCase());
		if(newResult === "none") {
			this.resultDisplay.setFontColor("lightcoral");
		} else { 
			this.resultDisplay.setFontColor("lightgreen"); 
		}
	}

	updateCardContent(i, newContent) { // i in {1,...,5}
		this.cardDisplays[i-1].updateContent(newContent);
	}

	holdCard(i) {
		this.cardDisplays[i-1].addClass("onHold");
	}

	unholdCard(i) {
		this.cardDisplays[i-1].removeClass("onHold");
	}

	enableHoldButton(i) {
		this.holdButtons[i-1].enable();
	}

	disableHoldButton(i) {
		this.holdButtons[i-1].disable();
	}

	pressHoldButton(i) {
		this.holdButtons[i-1].addClass("pressed");
	}

	unpressHoldButton(i) {
		this.holdButtons[i-1].removeClass("pressed");
	}

	showPayoutBoard() {
		document.querySelector(".payoutBoard").setAttribute("style", "display:flex");
	}

	hidePayoutBoard() {
		document.querySelector(".payoutBoard").setAttribute("style", "display:none");
	}

	showGameOverBoard() {
		document.querySelector(".gameOver").setAttribute("style", "display:block");
	}

	hideGameOverBoard() {
		document.querySelector(".gameOver").setAttribute("style", "display:none");
	}

	clearLog() {
		document.querySelector(".displayLog").innerHTML = "";
	}

	clearPayoutBoard() {
		document.querySelectorAll(".payoutElement.highlighted")
				.forEach(element => element.classList.remove("highlighted"));
	}

	updatePayoutBoard(newResult) {
		if(newResult !== "none") {
			let divLeft = document.querySelector("#" + stringToCamelCase(newResult));
			divLeft.classList.add("highlighted");
			let divRight = document.querySelector("#" + stringToCamelCase(newResult) + "Payout");
			divRight.classList.add("highlighted");
		}
	}

	displayCard(i, card) {
		this.updateCardContent(i, card.toString());
		let fontColor = card.isRed() ? "darkred" : "black";
		this.cardDisplays[i-1].setFontColor(fontColor);
	}

	updateLog(result) {
		this.logDisplay.addContent("Round " + roundCount + ": " + result + "<br>");
		this.logDisplay.handler.scrollTop = this.logDisplay.handler.scrollHeight;
	}
}

/* MAIN GAME-----------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/

// GLOBAL VARIABLES
let currentDeck;
let currentHand;
let sortedHand;
let roundCount;
let newHand;
let toHold;
let currentResult;
let lastResult;
let newResult;
let credit;
let payout;
let results;
let payouts;
let screen;


/*---------------------------------------------------------------------------------------*/
const newGame = () => {

	screen = new Screen();

	// establish round count & credit
	roundCount = 0;
	credit = 10;
	screen.updateRound(roundCount);
	screen.setCredit(credit);

	// toggle buttons
	screen.newGameButton.disable();
	screen.autoGameButton.disable();
	screen.autoRoundButton.enable();
	screen.dealButton.enable();

	// reset card panel
	[1,2,3,4,5].forEach(i => screen.updateCardContent(i, " "));
	[1,2,3,4,5].forEach(i => screen.unholdCard(i));
	[1,2,3,4,5].forEach(i => screen.unpressHoldButton(i));

	// clear screen
	screen.showPayoutBoard();
	screen.hideGameOverBoard();
	screen.clearLog();

	lastResult = "none";
} // END OF "newGame()"
/*---------------------------------------------------------------------------------------*/
const deal = () => {

	// initialize global variables
	currentDeck = new Deck();
	currentHand = new Hand();
	toHold = new Set();

	// maintain round count and credit
	screen.updateRound(++roundCount)/
	screen.setCredit(--credit);

	// toggle buttons
	screen.dealButton.disable();
	screen.drawButton.enable();
	screen.autoRoundButton.disable();
	[1,2,3,4,5].forEach(i => screen.enableHoldButton(i));
	[1,2,3,4,5].forEach(i => screen.unpressHoldButton(i));
	[1,2,3,4,5].forEach(i => screen.unholdCard(i));

	// clear payout board
	screen.clearPayoutBoard();

	// draw five cards
	[1,2,3,4,5].forEach(i => currentHand.addCard(currentDeck.draw()));

	// show cards in ascending order
	sortedHand = currentHand.sortByRank();

	// display each card
	[1,2,3,4,5].forEach(i => screen.displayCard(i, sortedHand[i-1]));

	// pre-draw outcome of the hand
	currentResult = currentHand.determineResult();
	screen.updateResult(currentResult);
	screen.updatePayoutBoard(currentResult);

} // END OF "deal()"
/*---------------------------------------------------------------------------------------*/
const hold = i => {

	if(toHold.has(i)) {
		toHold.delete(i);
		screen.unpressHoldButton(i);
		screen.unholdCard(i);
	} else {
		toHold.add(i);
		screen.pressHoldButton(i);
		screen.holdCard(i);
	}

} // END OF "hold()"
/*---------------------------------------------------------------------------------------*/
const draw = () => {
	newHand = new Hand();

	// toggle buttons
	screen.drawButton.disable();
	screen.dealButton.enable();
	screen.autoRoundButton.enable();
	[1,2,3,4,5].forEach(i => screen.disableHoldButton(i));

	// create & display new hand
	for(i=1; i<=5; i++) {
		if(toHold.has(i)) {
			newHand.addCard(sortedHand[i-1]);
		} else { 
			let currentCard = currentDeck.draw();
			screen.displayCard(i, currentCard);
			newHand.addCard(currentCard);
		}
	}

	// post-draw outcome of the hand
	let newResult = newHand.determineResult();
	screen.updateResult(newResult);
	
	// update credits
	let oldCredit = credit;
	credit += payout;
	let newCredit = credit;
	screen.updateCredit(oldCredit, newCredit);
	
	// update payout board
	screen.clearPayoutBoard();
	screen.updatePayoutBoard(newResult);

	// update log
	screen.updateLog(newResult);

	lastResult = newResult;

	if(credit === 0 && payout === 0) {
		gameOver();
	}
} // END OF "draw()"
/*---------------------------------------------------------------------------------------*/
const gameOver = () => {
	
	// toggle buttons
	screen.dealButton.disable();
	screen.newGameButton.enable();
	screen.autoRoundButton.disable();
	screen.autoGameButton.enable();

	// update info board
	screen.hidePayoutBoard();
	screen.showGameOverBoard();
	screen.gameOverDisplay.updateContent( 
		"<b>GAME OVER</b><br>You survived " + roundCount + " rounds" +
		"<br>Remember: The house always wins...");

} // END OF "gameOver()"
/*---------------------------------------------------------------------------------------*/
const autoRound = () => {
	deal();
	draw();
} // END OF "autoRound()"
/*---------------------------------------------------------------------------------------*/
const autoGame = () => {
	newGame();
	results = [];
	payouts = [];
	
	let myId = setInterval(() => {
		if(credit !== 0) {
			autoRound();
			results.push(lastResult);
			payouts.push(payout);
		} else { clearInterval(myId); }
	}, 1000 );
} // END OF "autoGame()"
/*---------------------------------------------------------------------------------------*/





