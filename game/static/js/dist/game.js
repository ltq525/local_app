class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class = "game_menu">
                <div class = "game_menu_field">
                    <!---空格隔开 索引多个class--->
                    <div class = "game_menu_field_item single">
                        单人模式
                    </div>
                    <br>
                    <div class = "game_menu_field_item multi">
                        多人模式
                    </div>
                    <br>
                    <div class = "game_menu_field_item settings">
                        设置
                    </div>
                </div>
            </div>
        `);
        this.root.$game.append(this.$menu);
        /* 找class前用. 找id前用# */
        this.$single = this.$menu.find('.single');
        this.$multi = this.$menu.find('.multi');
        this.$settings = this.$menu.find('.settings');

        this.start();
    }
    start() {
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single.click(function() {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function() {
            console.log("2")
        });
        this.$settings.click(function() {
            console.log("3")
        });
    }
    show() { /* 显示menu页面 */
        this.$menu.show();
    }   

    hide() { /* 关闭menu页面 */
        this.$menu.hide();
    }

}
let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        
        this.has_called_start = false; /* 处理start函数只执行一次 */
        GAME_OBJECTS.push(this);
        this.timedelta = 0; /* 当前帧距离上一帧的时间间隔 */
    }

    start() { /* 只会在第一帧执行 */

    }

    update() { /* 每一帧都执行 */

    }

    on_destory() { /* 删除前执行 */

    }

    destory() { /* 删除该物体 */
        this.on_destory();

        for(let i = 0; i < GAME_OBJECTS.length; i ++)
        {
            if (GAME_OBJECTS[i] === this) /* 三等号 需类型和值同时相等 */
            {
                GAME_OBJECTS.splice(i, 1); /* 删除函数 */
                break;
            }
        }

    } 
}

/* 利用时间计算 避免不同网页帧数不同的情况 */
let last_timestamp;
let GAME_ANIMATION = function(timestamp) {

    for(let i = 0; i < GAME_OBJECTS.length; i ++)
    {
        let obj = GAME_OBJECTS[i];
        if(!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else 
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION); /* 帧数刷新60hz */
class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); /* 画布 */
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() { 

    }

    update() { 
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; /* 第四个参数为背景透明度 */
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 5;
        this.vy = 5;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; /* 精度 */

        
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        }); /* 取消右键菜单 */
        this.playground.game_map.$canvas.mousedown(function(e) {
            /* 左键1 滚轮2 右键3 */
            if(e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            }
        });
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        if(this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        }
        else
        {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); /* 计算每一帧移动的距离 */
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);
        //this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        this.start();
    }

    start() {

    }

    show() { /* 显示playground页面 */
        this.$playground.show();
    }   

    hide() { /* 关闭playground页面 */
        this.$playground.hide();
    }
}
export class Game{
    constructor(id){
        this.id = id;
        this.$game = $('#' + id);
        //this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        
        this.start();
    }
    
    start() {

    }
}
