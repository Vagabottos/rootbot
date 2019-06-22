
export enum GirlDisc {
  Charge,
  BlastV,
  BlastH,
  Accele
}

export enum GirlElementalAttribute {
  Light,
  Dark,
  Flame,
  Forest,
  Aqua,
  Void
}

export enum GirlType {
  Defense,
  Attack,
  Support,
  Magia,
  Balance,
  Ultimate
}

export interface IConnect {
  name: string;
  abilities: Array<{ name: string, value: string }>;
}

export interface IMagia {
  name: string;
  abilities: Array<{ name: string, value: string }>;
}

export interface IDoppel {
  name: string;
  effects: string[];
}

export interface IGirlData {
  wikiLink: string;

  name: string;
  image: string;
  attImage: string;
  att: GirlElementalAttribute;
  type: GirlType;
  discs: GirlDisc[];

  memoria: string;
  memoriaLink: string;

  hp: number;
  atk: number;
  def: number;

  connect: IConnect;
  magia: IMagia;
  magia2?: IMagia;
  doppel?: IDoppel;
}

