
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';

@Singleton
@AutoWired
export class DatabaseService extends BaseService {

}
