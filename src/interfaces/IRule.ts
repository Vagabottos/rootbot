
export interface IRule {
  name: string;
  parent: string;
  index: string;
  color: string;

  pretext?: string;
  text?: string;
  subtext?: string;
  posttext?: string;

  children?: IRule[];
  subchildren?: IRule[];
}
