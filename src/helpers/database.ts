
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseHelper } from '../base/BaseHelper';

@Singleton
@AutoWired
export class DatabaseHelper extends BaseHelper {

}
