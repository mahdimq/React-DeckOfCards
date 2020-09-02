import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import './Deck.css';

function Deck() {
	const BASE_URL = 'https://deckofcardsapi.com/api/deck';

	const [deck, setDeck] = useState({});
	const [newCards, setNewCards] = useState([]);
	const [autoDraw, setAutoDraw] = useState(false);

	const timerId = useRef(null);

	// GET INITIAL DECK FROM API
	useEffect(() => {
		console.log('GETTING DECK');
		async function getDeck() {
			const res = await axios.get(`${BASE_URL}/new/shuffle`);
			setDeck(res.data); //<-- Set the state for the deck of cards
		}
		getDeck();

		// CLEAN UP
		return () => console.log('CLEANING UP');
	}, [setDeck]);

	// DRAW A CARD FROM THE ABOVE DECK
	useEffect(() => {
		console.log('DRAWING CARD');
		async function drawCard() {
			const { deck_id } = deck;
			try {
				const res = await axios.get(`${BASE_URL}/${deck_id}/draw`);
				console.log('REMAINING CARDS', res.data.remaining);
				if (res.data.remaining === 0) throw new Error('End of Deck');

				const card = res.data.cards[0]; //<-- Get a card and store it to variable

				// SET CARD TO STATE
				setNewCards((cards) => [
					...cards,
					{ id: card.code, image: card.image, name: `${card.value} OF ${card.suit}` }
				]);
			} catch (err) {
				setAutoDraw(false);
				console.log(err);
			}
		}

		// AUTO DRAW CARDS
		if (autoDraw && !timerId.current) {
			timerId.current = setInterval(async () => await drawCard(), 1000);
		}
		// CLEAN UP AND STOP INTERVAL
		return () => clearInterval(timerId.current, (timerId.current = null));
	}, [newCards, deck, autoDraw]);

	// TOGGLE AUTODRAW
	const toggleAutoDraw = () => {
		setAutoDraw((autoDraw) => !autoDraw);
	};

	// MAP THROUGH CARD ARRAY TO DISPLAY COMPONENT
	const drawnCards = newCards.map((c) => <Card key={c.id} image={c.image} name={c.name} />);

	return (
		<div className='Deck'>
			{deck ? (
				<button className='Deck-draw' onClick={toggleAutoDraw}>
					{autoDraw ? 'Stop' : 'Draw'}
				</button>
			) : null}
			<div className='Deck-cardarea'>{drawnCards}</div>
		</div>
	);
}

export default Deck;
