/*
 * What the data of 5e-bits does not have, read from the SRD 5.1 (English PDF): trade goods
 * (p. 72), food and drink (p. 73-74), poisons (p. 204-205). Prices in gp, texts in the Markdown of
 * 5e-bits (extract.js converts them like the rest).
 *
 * Left out: lodging and meals per day and the services (prices of a stay, not things), the
 * lifestyles. Livestock of the trade goods is an item where the SRD has no stat block (chicken,
 * sheep, pig, cow, ox); the goat has one and gets the price as a creature.
 */
"use strict";

// Trade Goods (p. 72): price, weight where the table names one pound
exports.tradeGoods = [
	{name: "Wheat", price: 0.01, weight: "1 lb", desc: "1 lb. of wheat."},
	{name: "Flour", price: 0.02, weight: "1 lb", desc: "1 lb. of flour."},
	{name: "Chicken", price: 0.02, desc: "One chicken."},
	{name: "Salt", price: 0.05, weight: "1 lb", desc: "1 lb. of salt."},
	{name: "Iron", price: 0.1, weight: "1 lb", desc: "1 lb. of iron."},
	{name: "Canvas", price: 0.1, desc: "1 sq. yd. of canvas."},
	{name: "Copper", price: 0.5, weight: "1 lb", desc: "1 lb. of copper."},
	{name: "Cotton cloth", price: 0.5, desc: "1 sq. yd. of cotton cloth."},
	{name: "Ginger", price: 1, weight: "1 lb", desc: "1 lb. of ginger."},
	{name: "Cinnamon", price: 2, weight: "1 lb", desc: "1 lb. of cinnamon."},
	{name: "Pepper", price: 2, weight: "1 lb", desc: "1 lb. of pepper."},
	{name: "Sheep", price: 2, desc: "One sheep."},
	{name: "Cloves", price: 3, weight: "1 lb", desc: "1 lb. of cloves."},
	{name: "Pig", price: 3, desc: "One pig."},
	{name: "Silver", price: 5, weight: "1 lb", desc: "1 lb. of silver."},
	{name: "Linen", price: 5, desc: "1 sq. yd. of linen."},
	{name: "Silk", price: 10, desc: "1 sq. yd. of silk."},
	{name: "Cow", price: 10, desc: "One cow."},
	{name: "Saffron", price: 15, weight: "1 lb", desc: "1 lb. of saffron."},
	{name: "Ox", price: 15, desc: "One ox."},
	{name: "Gold", price: 50, weight: "1 lb", desc: "1 lb. of gold."},
	{name: "Platinum", price: 500, weight: "1 lb", desc: "1 lb. of platinum."}
];

// Food, Drink, and Lodging (p. 73-74), the food and drink only
exports.food = [
	{name: "Ale, gallon", price: 0.2},
	{name: "Ale, mug", price: 0.04},
	{name: "Banquet (per person)", price: 10},
	{name: "Bread, loaf", price: 0.02},
	{name: "Cheese, hunk", price: 0.1},
	{name: "Meat, chunk", price: 0.3},
	{name: "Wine, common (pitcher)", price: 0.2},
	{name: "Wine, fine (bottle)", price: 10}
];

// Poisons (p. 204-205): type, price per dose, the DC of the Constitution save, the text of
// "Sample Poisons"
exports.poisons = [
	{name: "Assassin's Blood", type: "ingested", price: 150, dc: 10,
		desc: "A creature subjected to this poison must make a DC 10 Constitution saving throw. On a failed save, it takes 6 (1d12) poison damage and is poisoned for 24 hours. On a successful save, the creature takes half damage and isn't poisoned."},
	{name: "Burnt Othur Fumes", type: "inhaled", price: 500, dc: 13,
		desc: "A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or take 10 (3d6) poison damage, and must repeat the saving throw at the start of each of its turns. On each successive failed save, the character takes 3 (1d6) poison damage. After three successful saves, the poison ends."},
	{name: "Crawler Mucus", type: "contact", price: 200, dc: 13,
		desc: "This poison must be harvested from a dead or incapacitated crawler. A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 minute. The poisoned creature is paralyzed. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."},
	{name: "Drow Poison", type: "injury", price: 200, dc: 13,
		desc: "This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving throw fails by 5 or more, the creature is also unconscious while poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake."},
	{name: "Essence of Ether", type: "inhaled", price: 300, dc: 15,
		desc: "A creature subjected to this poison must succeed on a DC 15 Constitution saving throw or become poisoned for 8 hours. The poisoned creature is unconscious. The creature wakes up if it takes damage or if another creature takes an action to shake it awake."},
	{name: "Malice", type: "inhaled", price: 250, dc: 15,
		desc: "A creature subjected to this poison must succeed on a DC 15 Constitution saving throw or become poisoned for 1 hour. The poisoned creature is blinded."},
	{name: "Midnight Tears", type: "ingested", price: 1500, dc: 17,
		desc: "A creature that ingests this poison suffers no effect until the stroke of midnight. If the poison has not been neutralized before then, the creature must succeed on a DC 17 Constitution saving throw, taking 31 (9d6) poison damage on a failed save, or half as much damage on a successful one."},
	{name: "Oil of Taggit", type: "contact", price: 400, dc: 13,
		desc: "A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or become poisoned for 24 hours. The poisoned creature is unconscious. The creature wakes up if it takes damage."},
	{name: "Pale Tincture", type: "ingested", price: 250, dc: 16,
		desc: "A creature subjected to this poison must succeed on a DC 16 Constitution saving throw or take 3 (1d6) poison damage and become poisoned. The poisoned creature must repeat the saving throw every 24 hours, taking 3 (1d6) poison damage on a failed save. Until this poison ends, the damage the poison deals can't be healed by any means. After seven successful saving throws, the effect ends and the creature can heal normally."},
	{name: "Purple Worm Poison", type: "injury", price: 2000, dc: 19,
		desc: "This poison must be harvested from a dead or incapacitated purple worm. A creature subjected to this poison must make a DC 19 Constitution saving throw, taking 42 (12d6) poison damage on a failed save, or half as much damage on a successful one."},
	{name: "Serpent Venom", type: "injury", price: 200, dc: 11,
		desc: "This poison must be harvested from a dead or incapacitated giant poisonous snake. A creature subjected to this poison must succeed on a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."},
	{name: "Torpor", type: "ingested", price: 600, dc: 15,
		desc: "A creature subjected to this poison must succeed on a DC 15 Constitution saving throw or become poisoned for 4d6 hours. The poisoned creature is incapacitated."},
	{name: "Truth Serum", type: "ingested", price: 150, dc: 11,
		desc: "A creature subjected to this poison must succeed on a DC 11 Constitution saving throw or become poisoned for 1 hour. The poisoned creature can't knowingly speak a lie, as if under the effect of a zone of truth spell."},
	{name: "Wyvern Poison", type: "injury", price: 1200, dc: 15,
		desc: "This poison must be harvested from a dead or incapacitated wyvern. A creature subjected to this poison must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."}
];

// Livestock of the trade goods with a stat block
exports.creaturePrices = [
	{title: "Goat", price: 1}
];
