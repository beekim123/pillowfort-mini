import { _decorator } from 'cc';
import { PillowFort } from './ui/PillowFort';
const { ccclass } = _decorator;
/** Main.scene 的 Canvas 上只挂这一个组件。界面全部由代码创建。 */
@ccclass('Boot')
export class Boot extends PillowFort {}
