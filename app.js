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


/*


/* CLASSES-------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
class Card {
	rank = 0; // int between 2 and 14 (... 10, jacks, queen, king, ace)
	suit = 0; // int between 1 and 4 (clubs, diamonds, hearts, spades)

	constructor(rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}

	// METHODS
	isRed() { return (this.suit === 2 || this.suit === 3); }

	toString() {
		let newString = (this.rank <= 10) ? this.rank.toString() : "";
		switch(this.rank) {
			case 11: newString += "J"; break;
			case 12: newString += "Q"; break;
			case 13: newString += "K"; break;
			case 14: newString += "A"; break;
			default: newString += ""; break;
		}
		switch(this.suit) {
			case 1: newString += "&clubsuit;"; break;
			case 2: newString += "&diamondsuit;"; break;
			case 3: newString += "&heartsuit;"; break;
			case 4: newString += "&spadesuit;"; break;
			default: newString += ""; break;
		}
		return newString;
	}

} // END OF CLASS "Card"
/*---------------------------------------------------------------------------------------*/
class Hand {
	cards; // array of 5 cards
	ranks;	// array of corresponding ranks, r e {2,...,14}
	suits;	// array of corresponding suits, s e {1,...,4}

	constructor(cardArray) {
		this.cards = [...cardArray];
		this.ranks = this.cards.map(card => card.rank);
		this.suits = this.cards.map(card => card.suit);
	}

	addCard(newCard) {
		this.cards.push(newCard);
		this.ranks.push(newCard.rank);
		this.suits.push(newCard.suit);
	}

	/*** returns the i-th card / rank / suit of the hand, i e {1,...,5} */
	getCard(i) { return this.cards[i-1]; } 
	getRank(i) { return this.ranks[i-1]; }
	getSuit(i) { return this.suits[i-1]; }

	/*** returns a copy of the array of cards / ranks / suits associated with the hand */
	getCardArray() { return [...this.cards]; } 
	getRankArray() { return [...this.ranks]; } 
	getSuitArray() { return [...this.suits]; } 

	/*** returns a new hand with the cards sorted according to their rank */
	sortByRank() { 
		let cardArrayCopy = this.getCardArray(); // don't mutate original 'cards' array!
		let sortedCardArray = cardArrayCopy.sort((card1,card2) => card1.rank-card2.rank);
		return new Hand(sortedCardArray);
	} 

	/*** helper function for determining result */
	/*** returns the array of "steps" through the sorted rank array */
	deltaArray() {
		let sortedRanks = this.sortByRank().getRankArray();
		let deltaArray = [];
		[1,2,3,4].forEach(i =>
			deltaArray.push(sortedRanks[i] - sortedRanks[i-1]));
		return deltaArray;
	}

	/*** helper function for determining result */
	containsFlush() {
		return this.suits.map(suit => suit === this.suits[0]).
							reduce((p,q) => p && q);
	}

	determineResult() { 
		let sortedCards = this.sortByRank().cards;
		let deltas = this.deltaArray();
		let result = "none";
		payout = 0; // global => FIX!

		// The number of 1s in the delta array indicates straights and straight draws
		const numberOfOnes = deltas.filter((element) => element === 1).length;
		// The number of 0s in the delta array indicates multiplicity (pairs, triples etc)
		const numberOfZeros = deltas.filter((element) => element === 0).length;

		// CASE 1: delta array = [1,1,1,1] <=> result >= "straight"
		if(numberOfOnes === 4) {  // check for straight
			if(this.containsFlush()) { // check for straight flush
				if(sortedCards[4].rank === 14) { // check for royal flush
					result = "royal flush"; payout = 250;
				} else { result = "straight flush"; payout = 50 }
			} else { result = "straight"; payout = 4; }
		} 

		// CASE 2A - 2C: delta array contains 3 / 2 / 1 zero(s).
		switch(numberOfZeros) { 
			case 3: // 3 zeros; => (4,3) = 4 possibilities
				// consecutive 0s: (*000) | (000*)
				if(deltas[0] + deltas[3] !== 0) { 
					result = "four of a kind"; payout = 25; } 
				// non-consecutive 0s: (0*00) | (00*0)
				else { result = "full house"; payout = 9; } 
				break;
			case 2: // 2 zeros; => (4,2) = 6 possibilities
				// consecutive 0s: (00**) | (*00*) | (**00)
				if(deltas.lastIndexOf(0) - deltas.indexOf(0) === 1) { 
					result = "three of a kind"; payout = 3; }
				// non-consecutive 0s: 0**0 | 0*0* | *0*0
				else { result = "two pair"; payout = 2; } 
				break;
			case 1: // 1 zero: (0***) | (*0**) | (**0*) | (***0) (irrelevant)
				// only high pairs count as winning hand ("Jacks or Better")
				if(sortedCards[deltas.indexOf(0)].rank > 10) {
					result = "jacks or better"; payout = 1; }
				// low pairs don't pay
				else { result = "none"; payout = 0; }
		}

		// CASE 3: check for flush 
		if(result === "none" && this.containsFlush()) {
			result = "flush"; payout = 6;
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

	currentSize() {
		return this.cards.length;
	}

	drawCard() {
		let randomInt = getRandomInt(1, this.currentSize());
		let randomCard = this.cards[randomInt-1];
		this.cards.splice(randomInt-1, 1);
		return randomCard;
	}

	dealHand() { 
		return new Hand([1,2,3,4,5].map(i => this.drawCard()));
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

	// METHODS
	enable() { this.handler.removeAttribute("disabled"); }
	disable() { this.handler.setAttribute("disabled", true); }
	addClass(className) { this.handler.classList.add(className); }
	removeClass(className) { this.handler.classList.remove(className);}

} // END OF CLASS "ButtonHandler"
/*---------------------------------------------------------------------------------------*/
class DisplayHandler {
	selector;
	handler; 

	constructor(selector){
		this.selector = selector;
		this.handler = document.querySelector(this.selector);
	}

	// METHODS
	replaceContent(content) { this.handler.innerHTML = content; }
	addContent(content) { this.handler.innerHTML += content; }
	setFontColor(newColor) { (this.handler).style.color = newColor; }
	addClass(className) { this.handler.classList.add(className); }
	removeClass(className) { this.handler.classList.remove(className); }

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



	// METHODS

	updateRound(n) {
		this.roundDisplay.replaceContent("Round " + n.toString());
		this.roundDisplay.setFontColor("white");
	}

	setCredit(newCredit) {
		this.creditDisplay.replaceContent("Credit: " + newCredit.toString());
		this.creditDisplay.setFontColor("white");
	}

	updateCredit(oldCredit, newCredit) {
		this.creditDisplay.replaceContent("Credit: " + newCredit.toString() + 
			"   (+" + (newCredit-oldCredit).toString() + ")");
		let fontColor = (newCredit > oldCredit) ? "lightgreen" : "lightcoral";
		this.creditDisplay.setFontColor(fontColor);
	}

	updateResult(newResult) {
		this.resultDisplay.replaceContent(newResult.toUpperCase());
		let fontColor = (newResult !== "none") ? "lightgreen" : "lightcoral";
		this.resultDisplay.setFontColor(fontColor);
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

	updateCardContent(i, newContent) { this.cardDisplays[i-1].replaceContent(newContent); }
	holdCard(i) { this.cardDisplays[i-1].addClass("onHold"); }
	unholdCard(i) { this.cardDisplays[i-1].removeClass("onHold"); }
	enableHoldButton(i) { this.holdButtons[i-1].enable(); }
	disableHoldButton(i) { this.holdButtons[i-1].disable(); }
	pressHoldButton(i) { this.holdButtons[i-1].addClass("pressed"); }
	unpressHoldButton(i) { this.holdButtons[i-1].removeClass("pressed"); } 
	showPayoutBoard() { document.querySelector(".payoutBoard").setAttribute("style", "display:flex"); }
	hidePayoutBoard() { document.querySelector(".payoutBoard").setAttribute("style", "display:none"); }
	showGameOverBoard() { document.querySelector(".gameOver").setAttribute("style", "display:block"); }
	hideGameOverBoard() { document.querySelector(".gameOver").setAttribute("style", "display:none"); }
	clearLog() { document.querySelector(".displayLog").innerHTML = ""; }

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
	currentHand = currentDeck.dealHand();
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

	// show cards in ascending order
	sortedHand = currentHand.sortByRank();

	// display each card
	[1,2,3,4,5].forEach(i => screen.displayCard(i, currentHand.getCard(i)));

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
	newHand = new Hand([]);

	// toggle buttons
	screen.drawButton.disable();
	screen.dealButton.enable();
	screen.autoRoundButton.enable();
	[1,2,3,4,5].forEach(i => screen.disableHoldButton(i));

	// create & display new hand
	for(i=1; i<=5; i++) {
		if(toHold.has(i)) {
			newHand.addCard(currentHand.getCard(i));
		} else { 
			let currentCard = currentDeck.drawCard();
			newHand.addCard(currentCard);
			screen.displayCard(i, currentCard);
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
	screen.newGameButton.enable();
	screen.dealButton.disable();
	screen.autoRoundButton.disable();
	screen.autoGameButton.enable();

	// update info board
	screen.hidePayoutBoard();
	screen.showGameOverBoard();
	screen.gameOverDisplay.replaceContent( 
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





