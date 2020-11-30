
type Faction = 'eyrie' | 'duchy' | 'corvid' | 'cult' | 'marquise' | 'riverfolk' | 'vagabond' | 'woodland';
type Item = 'boot' | 'coin' | 'crossbow' | 'hammer' | 'sack' | 'sword' | 'tea' | 'torch';
type CardType = 'bird' | 'bunny' | 'fox' | 'mouse';

export interface IRootCard {
  name: string;
  owner?: Faction;
  image: string;
  text?: string;
  subtext?: string;
  type?: CardType;

  quest?: {
    cost: Item[],
    type: CardType
  };

  craft?: {
    cost: CardType[],
    item?: Item,
    vp?: number
  };
}

export interface IFortCard {
  name: string;
  image: string;
}

export interface IVastCard {
  name: string;
  image: string;
}

type OathSuit = 'order' | 'discord' | 'hearth' | 'beast' | 'nomad' | 'arcane';

export interface IOathCard {
  name: string;
  image: string;
  suit?: OathSuit;
  text?: string;
  defense?: number;
  relicRecoveryCost?: string;
  cardCapacity?: number;
  initialLoadout?: string;
  powerCost?: string;
}
