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
	cards;	// array of (usually 5) cards
	ranks;	// array of corresponding ranks, r e {2,...,14}
	suits;	// array of corresponding suits, s e {1,...,4}
	result;
	holdsPostSorting;
	holds;

	constructor(cardArray) {
		this.cards = [...cardArray];
		this.ranks = this.cards.map(card => card.rank);
		this.suits = this.cards.map(card => card.suit);
		this.result = ""
		this.holdsPostSorting = [];;
		this.holds = [];
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

	toString() {
		return this.cards.map(card => card.toString()).reduce((s1,s2) => s1+s2);
	}

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

		// CASE 1: result in the 'straight' family (RF, SF, S)
		let delta1 = deltas.map(d => (d===1) ? "1" : "x").reduce((s1,s2) => s1+s2);
		if(delta1 === "1111") {  // check for straight
			this.holdsPostSorting = [1,2,3,4,5];
			if(this.containsFlush()) { // check for straight flush
				if(sortedCards[4].rank === 14) { // check for royal flush
					this.result = "royal flush"; return this.result; 
				} else { this.result = "straight flush"; return this.result; } 
			} else { this.result = "straight"; return this.result; } 
		} 

		// CASE 2A - 2C: result involves multiples (Q, H, T, PP, HP. LP)
		let delta0 = deltas.map(d => (d===0) ? "0" : "x").reduce((s1,s2) => s1+s2);
		switch(delta0) { 
			case "x000": this.holdsPostSorting = [1,2,3,4,5]
				this.result = "four of a kind"; return this.result;
			case "000x": this.holdsPostSorting = [1,2,3,4];
				this.result = "four of a kind"; return this.result;
			case "0x00": this.holdsPostSorting = [1,2,3,4,5];
				this.result = "full house";	return this.result;
			case "00x0": this.holdsPostSorting = [1,2,3,4,5];
				this.result = "full house";	return this.result;
			case "00xx": this.holdsPostSorting = [1,2,3];
				this.result = "three of a kind"; return this.result;
			case "x00x": this.holdsPostSorting = [2,3,4];
				this.result = "three of a kind"; return this.result;
			case "xx00": this.holdsPostSorting = [3,4,5];
				this.result = "three of a kind"; return this.result;
			case "0xx0": this.holdsPostSorting = [1,2,4,5];
				this.result = "two pair"; return this.result;
			case "0x0x": this.holdsPostSorting = [1,2,3,4];
				this.result = "two pair"; return this.result;
			case "x0x0": this.holdsPostSorting = [2,3,4,5];
				this.result = "two pair"; return this.result;
			case "0xxx": this.holdsPostSorting = [1,2];
				this.result = (sortedCards[1].rank > 10) ? "jacks or better" : "low pair";
				return this.result;
			case "x0xx": this.holdsPostSorting = [2,3];
				this.result = (sortedCards[2].rank > 10) ? "jacks or better" : "low pair";
				return this.result;
			case "xx0x": this.holdsPostSorting = [3,4];
				this.result = (sortedCards[3].rank > 10) ? "jacks or better" : "low pair";
				return this.result;
			case "xxx0": this.holdsPostSorting = [4,5];
				this.result = (sortedCards[4].rank > 10) ? "jacks or better" : "low pair";
				return this.result;
			case "xxxx": this.holdsPostSorting = [1,2,3,4,5].filter(i => sortedCards[i-1].rank > 10);
				this.result = "high card"; return this.result;
		}

		// CASE 3: check for flush 
		if(this.containsFlush()) { 
			this.holdsPostSorting = [1,2,3,4,5];
			this.result = "flush";
			return this.result;
		}

		// CASE 4: not a paying outcome
		this.result = "none";
		return this.result;

	} // END OF METHOD determineResult()

	suggestedHolds() {
		let sortedCards = this.sortByRank().cards;
		this.holds = this.holdsPostSorting.map(i => this.cards.indexOf(sortedCards[i-1]) + 1);
		return this.holds;
	}

	determinePayout() {
		if(this.result !== "") { this.determineResult(); }

		switch(this.result) {
			case "royal flush": return 250;
			case "straight flush": return 50;
			case "four of a kind": return 25;
			case "full house": return 9;
			case "flush": return 6;
			case "straight": return 4
			case "three of a kind": return 3;
			case "two pair": return 2;
			case "jacks or better": return 1;
			case "low pair": return 0;
			case "none": return 0;
			default: return 0;
		}
	}
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
	autoHoldButton = new ButtonHandler(".actionButton.autoHold");
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
		if(newResult !== "none" && newResult !== "low pair" && newResult !== "high card") {
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

	updateLog(roundCount, result) {
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

class Game {

	screen;
	credit;
	roundCount;
	toHold;

	currentDeck;
	initialHand;
	newHand;
	
	lastResult;
	initialResult;
	newResult;

	results;
	payouts;
	

	newGame() {

		this.screen = new Screen();
	
		// establish round count & credit
		this.roundCount = 0;
		this.credit = 10;
		this.screen.updateRound(this.roundCount);
		this.screen.setCredit(this.credit);
	
		// toggle buttons
		this.screen.newGameButton.disable();
		this.screen.autoGameButton.disable();
		this.screen.autoRoundButton.enable();
		this.screen.dealButton.enable();
	
		// reset card panel
		[1,2,3,4,5].forEach(i => this.screen.updateCardContent(i, " "));
		[1,2,3,4,5].forEach(i => this.screen.unholdCard(i));
		[1,2,3,4,5].forEach(i => this.screen.unpressHoldButton(i));
	
		// clear screen
		this.screen.showPayoutBoard();
		this.screen.hideGameOverBoard();
		this.screen.clearLog();
	
		this.lastResult = "none";
	
	} // END OF newGame()

	deal() {

		// initialize global variables
		this.currentDeck = new Deck();
		this.initialHand = this.currentDeck.dealHand();
		this.toHold = new Set();
	
		// maintain round count and credit
		this.screen.updateRound(++this.roundCount)/
		this.screen.setCredit(--this.credit);
	
		// toggle buttons
		this.screen.dealButton.disable();
		this.screen.autoHoldButton.enable();
		this.screen.drawButton.enable();
		this.screen.autoRoundButton.disable();
		[1,2,3,4,5].forEach(i => this.screen.enableHoldButton(i));
		[1,2,3,4,5].forEach(i => this.screen.unpressHoldButton(i));
		[1,2,3,4,5].forEach(i => this.screen.unholdCard(i));
	
		// clear payout board
		this.screen.clearPayoutBoard();
	
		// display each card
		[1,2,3,4,5].forEach(i => this.screen.displayCard(i, this.initialHand.getCard(i)));
	
		// pre-draw outcome of the hand
		this.initialResult = this.initialHand.determineResult();
		this.screen.updateResult(this.initialResult);
		this.screen.updatePayoutBoard(this.initialResult);
	
	} // END OF deal()

	hold(i) {

		if(this.toHold.has(i)) {
			this.toHold.delete(i);
			this.screen.unpressHoldButton(i);
			this.screen.unholdCard(i);
		} else {
			this.toHold.add(i);
			this.screen.pressHoldButton(i);
			this.screen.holdCard(i);
		}
	
	} // END OF hold()

	autoHold() {
		this.initialHand.suggestedHolds().forEach(i => this.hold(i));
	}

	draw() {
		this.newHand = new Hand([]);
	
		// toggle buttons
		this.screen.dealButton.enable();
		this.screen.autoHoldButton.disable();
		this.screen.drawButton.disable();
		this.screen.autoRoundButton.enable();
		[1,2,3,4,5].forEach(i => this.screen.disableHoldButton(i));
	
		// create & display new hand
		for(let i=1; i<=5; i++) {
			if(this.toHold.has(i)) {
				this.newHand.addCard(this.initialHand.getCard(i));
			} else { 
				let newCard = this.currentDeck.drawCard();
				this.newHand.addCard(newCard);
				this.screen.displayCard(i, newCard);
			}
		}
	
		// post-draw outcome of the hand
		this.newResult = this.newHand.determineResult();
		this.screen.updateResult(this.newResult);
		let payout = this.newHand.determinePayout();
		
		// update credits
		let oldCredit = this.credit;
		this.credit += payout;
		let newCredit = this.credit;
		this.screen.updateCredit(oldCredit, newCredit);
		
		// update payout board
		this.screen.clearPayoutBoard();
		this.screen.updatePayoutBoard(this.newResult);
	
		// update log
		this.screen.updateLog(this.roundCount, this.newResult);
	
		this.lastResult = this.newResult;
	
		if(this.credit === 0 && payout === 0) {
			this.gameOver();
		}
	} // END OF draw()

	gameOver() {
	
		// toggle buttons
		this.screen.newGameButton.enable();
		this.screen.dealButton.disable();
		this.screen.autoRoundButton.disable();
		this.screen.autoGameButton.enable();
	
		// update info board
		this.screen.hidePayoutBoard();
		this.screen.showGameOverBoard();
		this.screen.gameOverDisplay.replaceContent( 
			"<b>GAME OVER</b><br>You survived " + this.roundCount + " rounds" +
			"<br>Remember: The house always wins...");
	
	} // END OF gameOver()

	autoRound() {
		this.deal();

		setTimeout(() => {
			this.autoHold();
		}, 500);

		setTimeout(() => {
			this.draw();
		}, 1000);

	} // END OF autoRound()

	autoGame() {
		this.newGame();
		this.results = [];
		this.payouts = [];
		
		let myId = setInterval(() => {
			if(this.credit !== 0) {
				this.autoRound();
				this.results.push(this.lastResult);
				this.payouts.push(this.payout);
			} else { clearInterval(myId); }
		}, 2000 );

	} // END OF autoGame()

}

const myGame = new Game();

