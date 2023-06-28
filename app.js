function getRandomInt(min, max) { // taken from MDN
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); 
}

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
    let result = "";

    switch(this.rank) {
      case 2: result += "2"; break;
      case 3: result += "3"; break;
      case 4: result += "4"; break;
      case 5: result += "5"; break;
      case 6: result += "6"; break;
      case 7: result += "7"; break;
      case 8: result += "8"; break;
      case 9: result += "9"; break;
      case 10: result += "10"; break;
      case 11: result += "J"; break;
      case 12: result += "Q"; break;
      case 13: result += "K"; break;
      case 14: result += "A"; break;
      default: result += "Error"; break;
    }

    switch(this.suit) {
      case 1: result += "&clubsuit;"; break;
      case 2: result += "&diamondsuit;"; break;
      case 3: result += "&heartsuit;"; break;
      case 4: result += "&spadesuit;"; break;
      default: result += "Error"; break;
    }

    return result;

  } // END OF METHOD "TOSTRING()"
} // END OF CLASS "CARD"
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

  containsFlush() { // working with ==, not with ===
    let suits = this.cards.map((card) => card.suit);
    return suits.reduce((suit1, suit2) => suit1 == suit2);
  }

  determineResult() {
    let sortedCards = this.sortByRank();
    let diffArray = this.makeDiffArray();
    let result = "none";
    payout = 0; // global

    const numberOfOnes = diffArray.filter((element) => element == 1).length;
    const numberOfZeros = diffArray.filter((element) => element == 0).length;

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

    // check for straight flush
    if(this.containsFlush()) {
      switch(result) {
        case "straight": result += " flush"; break;
        default: result = "flush"; break;
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
} // END OF CLASS 'HAND'
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

} // END OF CLASS "DECK"
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
}
/*---------------------------------------------------------------------------------------*/
class DisplayHandler {
  selector;
  handler; 

  constructor(selector){
    this.selector = selector;
    this.handler = document.querySelector(this.selector);
  }

  update(content) {
    this.handler.innerHTML = content;
  }

  setFontColor(newColor) {
    (this.handler).style.color = newColor;
  }

}
/*---------------------------------------------------------------------------------------*/


// GLOBAL VARIABLES
let currentDeck;
let currentHand;
let sortedHand;
let roundCount;
let newHand;
let toHold;
let currentResult;
let newResult;
let credit;
let payout;

// QUERY SELECTORS
const resultDisplay = new DisplayHandler(".display.result");
const roundDisplay = new DisplayHandler(".display.round");
const creditDisplay = new DisplayHandler(".display.credit");
const cardDisplays = [1,2,3,4,5].map(i => new DisplayHandler("#cardArea" + i));
/* ------------------------------------------------------- */
const newGameButton = new ButtonHandler(".newGameButton");
const dealHandButton = new ButtonHandler(".dealHandButton");
const drawButton = new ButtonHandler(".drawButton");
const holdButtons = [1,2,3,4,5].map(i => new ButtonHandler("#holdButton" + i));


const newGame = () => {
  
  // establish round count & credit
  roundCount = 0;  roundDisplay.update("Round");
  credit = 10;  creditDisplay.update("Credit: " + credit);

  // toggle buttons
  newGameButton.disable();
  dealHandButton.enable();
}



const dealHand = () => {
  
  // initialize global variables
  currentDeck = new Deck();
  currentHand = new Hand();
  toHold = new Set();

  // maintain round count and credit
  roundDisplay.update("Round " + ++roundCount);
  creditDisplay.update("Credit: " + --credit);

  // toggle buttons
  dealHandButton.disable();
  drawButton.enable();
  holdButtons.forEach(button => button.enable());

  // draw five cards
  for(let i=1; i<=5; i++) {
    currentHand.addCard(currentDeck.draw());
  }

  // show cards in ascending order
  sortedHand = currentHand.sortByRank();

  // display each card
  for(let i=1; i<=5; i++) {
    let currentCard = sortedHand[i-1];
    let currentCardDisplay = cardDisplays[i-1];
    currentCardDisplay.update(currentCard.toString());
    
    if(currentCard.isRed()) {
      currentCardDisplay.setFontColor("darkred");
    } else {currentCardDisplay.setFontColor("black");}
  }

  // pre-draw outcome of the hand
  currentResult = currentHand.determineResult();
  resultDisplay.update(currentResult.toUpperCase());
  
} // END OF "DEAL HAND()"


const hold = i => {
  toHold.add(i);
  holdButtons[i-1].disable();
}


const draw = () => {
  newHand = new Hand();

  // toggle buttons
  drawButton.disable();
  dealHandButton.enable();
  holdButtons.forEach(button => button.disable())

  // create & display new hand
  for(i=1; i<=5; i++) {
    if(toHold.has(i)) {
      newHand.addCard(sortedHand[i-1]);
    } else { 
      let currentCard = currentDeck.draw();
      let currentCardDisplay = cardDisplays[i-1];

      newHand.addCard(currentCard);
      currentCardDisplay.update(currentCard.toString());
      
      if(currentCard.isRed()) {
        currentCardDisplay.setFontColor("darkred");
      } else {currentCardDisplay.setFontColor("black")};
    }
  }

  // post-draw outcome of the hand
  let newResult = newHand.determineResult();
  resultDisplay.update(newResult.toUpperCase());

  // update credits
  credit += payout;
  creditDisplay.update("Credit: " + credit + " (+" + payout + ")");
}

