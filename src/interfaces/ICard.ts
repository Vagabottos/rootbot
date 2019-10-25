
type Faction = 'eyrie' | 'duchy' | 'corvid' | 'cult' | 'marquise' | 'riverfolk' | 'vagabond' | 'woodland';
type Item = 'boot' | 'coin' | 'crossbow' | 'hammer' | 'sack' | 'sword' | 'tea' | 'torch';
type CardType = 'bird' | 'bunny' | 'fox' | 'mouse';

export interface ICard {
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
