/* HELPER FUNCTIONS----------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
function getRandomInt(min, max) { // taken from MDN
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
}
/*---------------------------------------------------------------------------------------*/
function stringToCamelCase(str) {
	let array = str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1));
	array[0] = array[0].toLowerCase();
	let camelCase = array.reduce((str1, str2) => str1 + str2);
	return camelCase;
} 
/*---------------------------------------------------------------------------------------*/



/* CLASSES-------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
class Card {
	rank; // int between 2 and 14 (... 10, jacks, queen, king, ace)
	suit; // int between 1 and 4 (clubs, diamonds, hearts, spades)

	constructor(rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}

	getRankID() { return this.rank; }
	getSuitID() { return this.suit; }
	isRed() { return (this.suit === 2 || this.suit === 3); }
	isHighCard() { return (this.rank > 10); }
	isAce() { return (this.rank === 14); }

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
			case 1: newString += "\u2663"; break;
			case 2: newString += "\u2666"; break;
			case 3: newString += "\u2665"; break;
			case 4: newString += "\u2660"; break;
			default: newString += ""; break;
		}
		return newString;
	}

} 
/*---------------------------------------------------------------------------------------*/
class Hand {
	cards;	// array of (usually 5) cards
	ranks;	// array of corresponding ranks, r e {2,...,14}
	suits;	// array of corresponding suits, s e {1,...,4}

	holdsPostSorting;
	holds;

	constructor(cardArray) {
		this.cards = [...cardArray];
		this.ranks = this.cards.map(card => card.getRankID());
		this.suits = this.cards.map(card => card.getSuitID());
		this.holdsPostSorting = [];
		this.holds = [];
	}

	addCard(newCard) {
		this.cards.push(newCard);
		this.ranks.push(newCard.getRankID());
		this.suits.push(newCard.getSuitID());
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
		return this.cards.map(card => card.toString()).
							reduce((s1,s2) => s1 + "|" + s2);
	}

	/*** returns a new hand with the cards sorted according to their rank */
	sortByRank() { 
		let cardsCopy = this.getCardArray(); // don't mutate original 'cards' array!
		let sortedCards = cardsCopy.sort((c1,c2) => c1.getRankID()-c2.getRankID());
		return new Hand(sortedCards);
	} 

	/*** returns the outcome of the hand as a string */
	getOutcome() {
		let sortedCards = this.sortByRank().cards;
		let deltas = this.deltaArray();

		// CASE 1: outcome in the 'straight' family (RF, SF, S)
		let delta1 = deltas.map(d => (d===1) ? "1" : "x").reduce((s1,s2) => s1+s2);
		if(delta1 === "1111") {  // check for straight
			this.holdsPostSorting = [1,2,3,4,5];
			if(this.containsFlush()) { // check for straight flush
				if(sortedCards[4].isAce()) { // check for royal flush
					return "royal flush"; }
				else { return "straight flush"; } 
			} else { return "straight"; } 
		} 

		// CASE 2A - 2C: result involves multiples (Q, H, T, PP, HP. LP)
		let delta0 = deltas.map(d => (d===0) ? "0" : "x").reduce((s1,s2) => s1+s2);
		switch(delta0) { 
			case "x000": this.holdsPostSorting = [2,3,4,5]; return "four of a kind";
			case "000x": this.holdsPostSorting = [1,2,3,4]; return "four of a kind";
			case "0x00": this.holdsPostSorting = [1,2,3,4,5]; return "full house";
			case "00x0": this.holdsPostSorting = [1,2,3,4,5]; return "full house";
			case "00xx": this.holdsPostSorting = [1,2,3]; return "three of a kind";
			case "x00x": this.holdsPostSorting = [2,3,4]; return "three of a kind";
			case "xx00": this.holdsPostSorting = [3,4,5]; return "three of a kind"; 
			case "0xx0": this.holdsPostSorting = [1,2,4,5]; return "two pair";
			case "0x0x": this.holdsPostSorting = [1,2,3,4]; return "two pair"; 
			case "x0x0": this.holdsPostSorting = [2,3,4,5]; return "two pair";
			case "0xxx": this.holdsPostSorting = [1,2];
				return (sortedCards[1].isHighCard()) ? "jacks or better" : "low pair";
			case "x0xx": this.holdsPostSorting = [2,3];
				return (sortedCards[2].isHighCard()) ? "jacks or better" : "low pair";
			case "xx0x": this.holdsPostSorting = [3,4];
				return (sortedCards[3].isHighCard()) ? "jacks or better" : "low pair";
			case "xxx0": this.holdsPostSorting = [4,5];
				return (sortedCards[4].isHighCard()) ? "jacks or better" : "low pair";
			case "xxxx": this.holdsPostSorting = [1,2,3,4,5].filter(i => sortedCards[i-1].isHighCard());
				return this.holdsPostSorting.length > 0 ? "high card" : "none";
		}

		// CASE 3: check for flush 
		if(this.containsFlush()) { 
			this.holdsPostSorting = [1,2,3,4,5];
			return "flush";
		}

		// CASE 4: not a paying outcome
		return "none";

	} // END OF getOutcome()

	getPayout() {
		let outcome = this.getOutcome();
		switch(outcome) {
			case "royal flush": return 250; 
			case "straight flush": return 50; 
			case "four of a kind": return 25;
			case "full house": return 9;
			case "flush": return 6;
			case "straight": return 4;
			case "three of a kind": return 3;
			case "two pair": return 2;
			case "jacks or better": return 1;
			case "low pair": return 0;
			case "none": return 0;
			default: return 0; 
		}
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

	suggestedHolds() { // TODO
		let sortedCards = this.sortByRank().cards;
		this.holds = this.holdsPostSorting.map(i => this.cards.indexOf(sortedCards[i-1]) + 1);
		return this.holds;
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

	drawCard() {
		let randomInt = getRandomInt(1, this.currentSize());
		let randomCard = this.cards[randomInt-1];
		this.cards.splice(randomInt-1, 1);
		return randomCard;
	}

	dealHand() { return new Hand([1,2,3,4,5].map(i => this.drawCard())); }
	currentSize() { return this.cards.length; }


}
/*---------------------------------------------------------------------------------------*/
class ElementHandler {
	selector;
	handler;
	
	constructor(selector) {
		this.selector = selector;
		this.handler = document.querySelector(this.selector); 
	}

	addClass(className) { this.handler.classList.add(className); return this; }
	removeClass(className) { this.handler.classList.remove(className); return this; }
}
/*---------------------------------------------------------------------------------------*/
class ButtonHandler extends ElementHandler {
	constructor(selector) { super(selector); }

	enable() { this.handler.removeAttribute("disabled"); }
	disable() { this.handler.setAttribute("disabled", true); }
} 
/*---------------------------------------------------------------------------------------*/
class DisplayHandler extends ElementHandler {
	constructor(selector) { super(selector); }

	hide() { this.addClass("hidden"); }
	show() { this.removeClass("hidden"); }
	addContent(content) { this.handler.innerHTML += content; }
	replaceContent(content) { this.handler.innerHTML = content; }
	setFontColor(newColor) { (this.handler).style.color = newColor; }
	replaceClass(class1, class2) { this.addClass(class2).removeClass(class1); } // !
	enableScroll() { this.handler.scrollTop = this.handler.scrollHeight; }
} 
/*---------------------------------------------------------------------------------------*/
class Screen {

	// BUTTON HANDLERS
	newGameButton = new ButtonHandler(".actionButton.newGame");
	dealButton = new ButtonHandler(".actionButton.deal");
	drawButton = new ButtonHandler(".actionButton.draw");
	holdButtons = [1,2,3,4,5].map(i => new ButtonHandler("#holdButton" + i));
	autoHoldButton = new ButtonHandler(".actionButton.autoHold");
	autoRoundButton = new ButtonHandler(".actionButton.autoRound");
	autoGameButton = new ButtonHandler(".actionButton.autoGame");

	// COLORS
	winningColor ="lightgreen";
	//losingColor = "lightcoral";
	losingColor = "whitesmoke";


/* STATES *************************************************************************************/

	newGameState() {
		this.hideStats();

		let creditDisplay = new DisplayHandler(".display.credit");
		creditDisplay.replaceContent("Credit: 10");
		creditDisplay.setFontColor("white");

		let roundDisplay = new DisplayHandler(".display.round");
		roundDisplay.replaceContent("Round " + 0); 

		// toggle buttons
		this.newGameButton.disable();
		this.autoGameButton.disable();
		this.autoRoundButton.enable();
		this.dealButton.enable();
	
		// reset card panel
		this.cardDisplaysClear();
		[1,2,3,4,5].forEach(i => this.unholdCard(i));
		[1,2,3,4,5].forEach(i => this.unpressHoldButton(i));
	
		// clear screen
		new DisplayHandler(".gameOver").hide();
		new DisplayHandler(".welcome").hide();
		new DisplayHandler(".infoPanel").show();
		new DisplayHandler(".payoutBoard").show();

		this.clearLog();	
	}

	dealState(roundCount, credit, hand, outcome) {

		let creditDisplay = new DisplayHandler(".display.credit");
		creditDisplay.replaceContent( "Credit: " + credit);
		creditDisplay.setFontColor("white");
		creditDisplay.replaceClass("draw", "deal"); 

		let roundDisplay = new DisplayHandler(".display.round");
		roundDisplay.replaceContent("Round " + roundCount);

		let outcomeDisplay = new DisplayHandler(".display.result"); 
		outcomeDisplay.replaceContent(outcome.toUpperCase());
		outcomeDisplay.setFontColor(Game.winningOutcomes.includes(outcome) ? 
										this.winningColor : this.losingColor);
		outcomeDisplay.replaceClass("draw", "deal");
	
		// toggle buttons
		this.dealButton.disable();
		this.autoHoldButton.enable();
		this.drawButton.enable();
		this.autoRoundButton.disable();
		[1,2,3,4,5].forEach(i => this.enableHoldButton(i));
		[1,2,3,4,5].forEach(i => this.unpressHoldButton(i));
		[1,2,3,4,5].forEach(i => this.unholdCard(i));
	
		// display each card
		[1,2,3,4,5].forEach(i => this.displayCard(i, hand.getCard(i)));
	
		// remove previous highlights from payout board
		document.querySelectorAll(".payoutElement")
				.forEach(element => element.classList.remove("highlighted", "deal", "draw"));

		// highlight row according to outcome
		if(Game.winningOutcomes.includes(outcome)) {
			let divLeft = document.querySelector("#" + stringToCamelCase(outcome));
			divLeft.classList.add("highlighted", "deal");
			let divRight = document.querySelector("#" + stringToCamelCase(outcome) + "Payout");
			divRight.classList.add("highlighted", "deal");
		}
	} 

	drawState(roundCount, hand, outcome, credit, payout) {

		let creditDisplay = new DisplayHandler(".display.credit");
		creditDisplay.replaceClass("deal", "draw");
		creditDisplay.replaceContent("Credit: " + (credit+payout) + "   (+" + payout + ")");
		creditDisplay.setFontColor(payout > 0 ? this.winningColor : this.losingColor);
	
		let outcomeDisplay = new DisplayHandler(".display.result"); 
		outcomeDisplay.replaceClass("deal", "draw");
		outcomeDisplay.replaceContent(outcome.toUpperCase());
		outcomeDisplay.setFontColor(payout > 0 ? this.winningColor : this.losingColor);

		// toggle buttons
		this.dealButton.enable();
		this.autoHoldButton.disable();
		this.drawButton.disable();
		this.autoRoundButton.enable();
		[1,2,3,4,5].forEach(i => this.disableHoldButton(i));

		// display each card
		[1,2,3,4,5].forEach(i => this.displayCard(i, hand.getCard(i)));

		// strip previous highlighting from payout board
		document.querySelectorAll(".payoutElement")
				.forEach(element => element.classList.remove("highlighted", "deal", "draw"));

		// highlight row according to outcome
		if(Game.winningOutcomes.includes(outcome)) {
			let divLeft = document.querySelector("#" + stringToCamelCase(outcome));
			divLeft.classList.add("highlighted", "draw");
			let divRight = document.querySelector("#" + stringToCamelCase(outcome) + "Payout");
			divRight.classList.add("highlighted", "draw");
		}
	
		// update log
		this.updateLog(roundCount, outcome);
	} 

	gameOverState(roundCount) {
		new DisplayHandler(".payoutBoard").hide();
		
		let gameOverDisplay = new DisplayHandler(".gameOver");
		gameOverDisplay.show();
		gameOverDisplay.replaceContent( 
			"<b>GAME OVER</b><br>You survived " + roundCount + " rounds" +
			"<br>Remember: The house always wins...");

		// toggle buttons
		this.newGameButton.enable();
		this.dealButton.disable();
		this.autoRoundButton.disable();
		this.autoGameButton.enable();
		
		this.showStats();
	}


/* METHODS *************************************************************************************/

	holdCard(i) { new DisplayHandler("#cardArea" + i).addClass("onHold"); }
	unholdCard(i) { new DisplayHandler("#cardArea" + i).removeClass("onHold"); }
	enableHoldButton(i) { this.holdButtons[i-1].enable(); }
	disableHoldButton(i) { this.holdButtons[i-1].disable(); }
	pressHoldButton(i) { this.holdButtons[i-1].addClass("pressed"); }
	unpressHoldButton(i) { this.holdButtons[i-1].removeClass("pressed"); } 
	clearLog() { document.querySelector(".displayLog").innerHTML = ""; }
	showStats() { document.querySelector(".showStatsDiv").classList.remove("hidden"); }
	hideStats() { document.querySelector(".showStatsDiv").classList.add("hidden"); }

	displayCard(i, card) {
		let cardDisplay = new DisplayHandler("#cardArea" + i);
		cardDisplay.replaceContent(card.toString());
		cardDisplay.setFontColor(card.isRed() ? "darkred" : "black");
	}

	cardDisplaysClear() {
		for(let i=1; i<=5; i++) {
			new DisplayHandler("#cardArea" + i).replaceContent(" ");
		}
	}

	updateLog(roundCount, result) { 
		let newRow = document.createElement("div");
		newRow.setAttribute("class", "displayLogRow");
		newRow.setAttribute("id", "row" + roundCount);
		let logDisplay = new DisplayHandler(".displayLog");
		logDisplay.handler.appendChild(newRow);
		logDisplay.enableScroll();

		let content = "Round " + roundCount + ": " + result + "<br>";
		let winning = Game.winningOutcomes.includes(result);
		let fontColor = winning ? this.winningColor : this.losingColor;
		let rowDisplay = new DisplayHandler("#row" + roundCount);
		rowDisplay.addContent(content);
		rowDisplay.setFontColor(fontColor);
	}
}

/* MAIN GAME-----------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/

class Game {

	screen;
	credit;
	roundCount;
	toHold;

	currentDeck;
	initHand;
	finalHand;
	
	initOutcome;
	finalOutcome;

	creditHistory;

	static winningOutcomes = ["royal flush", "straight flush", "four of a kind", "full house",
				"flush", "straight", "three of a kind", "two pair", "jacks or better"];
	

	newGame() {
		this.screen = new Screen();
		this.creditHistory = [];

		this.roundCount = 0;
		this.credit = 10;
		this.creditHistory.push(this.credit);
		
		this.screen.newGameState();
	}

	deal() {
		this.currentDeck = new Deck();
		this.initHand = this.currentDeck.dealHand();
		this.toHold = new Set();
	
		this.roundCount++;
		this.credit--;
	
		this.initOutcome = this.initHand.getOutcome();
		this.screen.dealState(this.roundCount, this.credit, this.initHand, this.initOutcome);

		// auto hold
		//this.initHand.suggestedHolds().forEach(i => this.hold(i));
	} 

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
	} 

	autoHold() { this.initHand.suggestedHolds().forEach(i => this.hold(i)); }

	draw() {
	
		// create new hand
		this.finalHand = new Hand([]);
		for(let i=1; i<=5; i++) {
			if(this.toHold.has(i)) {
				this.finalHand.addCard(this.initHand.getCard(i));
			} else { this.finalHand.addCard(this.currentDeck.drawCard()); }
		}

		// post-draw outcome of the hand
		this.finalOutcome = this.finalHand.getOutcome();
		let payout = this.finalHand.getPayout(); 
		this.screen.drawState(this.roundCount, this.finalHand, this.finalOutcome, 
								this.credit, payout);
	
		this.credit += payout;
		this.creditHistory.push(this.credit);
	
		if(this.credit === 0 && payout === 0) { this.gameOver(); }
	}

	gameOver() {
		let creditString = this.creditHistory.map(credit => "<br>" + "*".repeat(credit))
										.reduce((a,b) => a+b);
		document.querySelector(".stats").innerHTML = creditString;
		this.screen.gameOverState(this.roundCount);
	} 

	showStats() {}

	autoRound() {
		this.deal();
		setTimeout(() => {this.autoHold();}, 500);
		setTimeout(() => {this.draw();}, 1000);
	} 

	autoGame() {
		this.newGame();
		
		let myId = setInterval(() => {
			if(this.credit !== 0) {
				this.autoRound();
			} else { clearInterval(myId); }
		}, 2000 );
	}

	instaGame() {
		this.newGame();

		while(this.credit !== 0) {
			this.deal();
			this.autoHold();
			this.draw();
		}
	}
}

const myGame = new Game();

