import Sprite from './Sprite';
import Boom from './Boom';
import '../Util/expand';

export default class Bullet extends Sprite {
    width = 8;
    height = 8;
    team = 0;
    power = 1;
    speed = 5;
    isIdle = true;
    _boom = null;

    constructor(team, power, speed) {
        super();
        this.team = team;
        this.power = power;
        this.speed = speed;
        this.img = Loader.imgArr[3];
        this._boom = new Boom(false);
        Game.unit.push(this);
    }

    isCanPass(unit) {
        // 子弹可通过水和倒旗
        return unit.team === 10 && (unit.type === 3 || unit.type === 2);
    }

    update() {
        if (this.isIdle) {
            return;
        }

        this.updateNext(); // 更新下一步的位置以便于计算碰撞

        // 不在地图内
        if (!this.nextIsInMap()) {
            this.idle();
            return;
        }

        // 对 接触到 并且 不为盟友 的单位执行动作
        const target = Game.barrier.find(unit => !this.isCanPass(unit) && (this.collidesWith(unit) && this.team !== unit.team));
        if (target instanceof Tank) {
            target.damage();
        }

        if (target instanceof Bullet) {
            target.idle();
        }

        if (target instanceof TileLayer) {
            Game.barrier.filter(otherTile => otherTile instanceof TileLayer &&
                this.collidesWith(otherTile, 20) && ((otherTile.type === 6 || this.power >= 2) &&
                    otherTile.type !== 1))
                .forEach(unit => unit.destroy());
            if (target.type === 6 || this.power >= 2 || target.type === 1) {
                target.destroy();
            }
        }
        this.idle();
        this.go();
        this.draw();
    }

    shot(x, y, angel) {
        this.isIdle = false;

        // 调整子弹到坦克前方的位置 up right down left
        switch (angel) {
            case 0:
                x += 12;
                y -= 8;
                break;
            case 90:
                x += 32;
                y += 12;
                break;
            case 180:
                x += 12;
                y += 32;
                break;
            case 270:
                x -= 8;
                y += 12;
                break;
            default:
                break;
        }
        this.x = x;
        this.y = y;
        this.angel = angel;
        Game.barrier.push(this);
    }

    idle() {
        this.hit();
        this.hide();
        this.isIdle = true;

        Game.barrier.remove(this);
    }

    hit() {
        if (!this._boom) {
            console.error(this);
        } else {
            this._boom.start(this.x - 28, this.y - 28);
        }
    }
}
