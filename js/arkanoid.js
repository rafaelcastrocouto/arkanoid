var Game = function(){ 
  var game = {
    init: function(){ 
      game.fps = 50;
      game.rate = 1000 / game.fps;
      game.events.init();
      game.css.init();
      game.container.init();
      game.menu.init();
      game.score.init();
      game.audio.init();
    },
    create: function(t, props){
      var el = document.createElement(t);
      el.on = game.on;
      if(props){for(i in props){el[i] = props[i];}}
      return el;
    }, 
    add: function(el, parent){
      if(!parent) parent = document.body;
      parent.appendChild(el);
    },
    clear: function(el){
      if (el.hasChildNodes()){
        while (el.childNodes.length){
          el.removeChild( el.firstChild );       
        } 
      }
    },
    round: function(n){
      return (Math.round(n*1000)/1000);
    },

    ///////////////////////////////STYLE///////////////////////////////

    css: {
      init: function(){
        game.width = 1000;
        game.height = 750;  
        game.css.paint('#bbb');
        var el = game.create('style',{id: 'css'}); 
        game.add(el);
        game.css.el = el;
        game.css.resize();
      },
      events: function(){
        window.on('orientationchange', game.css.resize);
        window.on('resize', game.css.resize);
      },
      resize: function(){ 
        var rate = game.height / game.width;
        var width = window.innerWidth;
        var height = window.innerHeight;
        if(height > width * rate) game.convert = (width / 1000);
        else game.convert = (height / rate / 1000);
        game.px = function(n){
          return game.round(n * game.convert) + 'px';
        };
        game.window = {
          height: window.innerHeight / game.convert,
          width: window.innerWidth / game.convert
        }
        game.css.rules = {
          '.button': { 
            'height': game.px(70),
            'width': game.px(300),
            'pading': game.px(15),
            'font-size': game.px(32)
          },       
          '.shadow' : {
            'box-shadow': '0 0 ' + game.px(15) + ' black'
          }
        },
        game.container.css();
        game.menu.css();
        game.ui.css();
        game.stage.css();
        game.css.updateBlocks();
        game.css.updateBalls();
        game.css.updatePad();
        game.css.updateRules();
      },
      updateBlocks: function(){
        if(game.block) {
          var blocks = game.block.array;
          if(blocks && blocks.length > 0) {
            for(b in blocks) game.block.css(blocks[b]);
          }
        }        
      },
      updateBalls: function(){
        if(game.ball) {
          var balls = game.ball.array;
          if(balls && balls.length > 0) {
            for(b in balls) game.ball.css(balls[b]);
          }  
        }       
      },
      updatePad: function(){
        if(game.pad) {
          var pad = game.pad;
          if(pad && pad.el) game.pad.css(); 
        }   
      },
      updateRules: function(){
        var st = '\n';
        for(var selector in game.css.rules){
          st += selector + ' {\n';
          var styles = game.css.rules[selector];
          for(var style in styles){
            var color = styles[style];
            if(style == 'background') {
              var c = game.css.background(color);
              st += '  background: ' + c.join(';\n  background: ') + ';\n';
            } else st += '  '+style + ' :' + color + ';\n';
          };
          st += '}\n'
        };
        game.css.el.textContent = st;
      },
      addRule: function(sel, obj){
        for(var s in obj){
          if(!game.css.rules[sel]) game.css.rules[sel] = {};
          game.css.rules[sel][s] = obj[s];
        };
        game.css.updateRules()
      },
      style: function(obj, el){
        if(!el) el = document.body;
        for(var s in obj){
          el.style[s] = obj[s];
        };
      },
      paint: function(color, obj){ 
        var el;
        var bkg = game.css.background(color);
        if(!obj) el = document.body;
        else if(obj.el) el = obj.el;
        for(b in bkg) el.style.background = bkg[b];
      },
      background: function(color, inv){
        if(!inv) inv = 1;
        var c = {
          r: parseInt(color[1], 16) + (6 * -inv),
          g: parseInt(color[2], 16) + (6 * -inv),
          b: parseInt(color[3], 16) + (6 * -inv)
        };
        if(c.r < 0) c.r = 0; if(c.r > 15) c.r = 15; 
        if(c.g < 0) c.g = 0; if(c.g > 15) c.g = 15; 
        if(c.b < 0) c.b = 0; if(c.b > 15) c.b = 15;

        var color2 = '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
        var bkg = [ color,
        '-webkit-radial-gradient(center, ellipse cover, '+color+' 0%,'+color2+' 100%)',
        '-moz-radial-gradient(center, ellipse cover, '+color+' 0%,'+color2+' 100%)'];
        return bkg;
      }
    },

    ///////////////////////////////CONTAINER///////////////////////////////

    container: {
      init: function(){
        game.container.el = game.create('div',{
          id: 'container', 
          className: 'shadow'
        });
        game.add(game.container.el);  
        game.container.css();
      },
      css: function(){
        game.container.height = (game.height * 0.96);
        game.container.width = (game.width * 0.96);
        game.container.top = (game.window.height / 2) - (game.height * 0.95 / 2);
        game.container.left = (game.window.width / 2) - (game.width * 0.95 / 2);        
        game.css.addRule('#container', {
            'background': '#69a',
            'border-radius': game.px(5), 
            'height': game.px(game.container.height),
            'width': game.px(game.container.width),
            'top': game.px(game.container.top),
            'left': game.px(game.container.left)
        });
      },      
      add: function(el){
        game.container.el.appendChild(el);
      } 
    },

    ///////////////////////////////MENU///////////////////////////////

    menu: {
      init: function(){
        game.mode = 'menu';
        game.menu.el = game.create('div', {id: 'menu'});
        game.container.add(game.menu.el);
        game.menu.css();
        game.menu.addButtons();  
      },    
      css: function(){
        game.menu.width = 300;
        game.menu.height = 280;
        game.menu.left = (game.width / 2) - (300 / 2);
        game.menu.top = (game.height / 2) - (280 / 2);
        game.css.addRule('#menu',{
          'width': game.px(game.menu.width),
          'height': game.px(game.menu.height),
          'left': game.px(game.menu.left),
          'top': game.px(game.menu.top)
        });
      },
      add: function(el){
        game.menu.el.appendChild(el);
      },  
      addButtons: function(){
        game.menu.buttons.newGame();
        game.menu.buttons.loadGame();
        game.menu.buttons.highScore();
        game.menu.buttons.github(); 
        game.menu.buttons.credits();            
      },
      buttons: {
        newGame: function(){
          var props = {
            id: 'newGame', 
            className: 'button',
            textContent: 'NEW GAME'
          };
          game.menu.newGame.el = game.create('button', props);
          game.menu.add(game.menu.newGame.el);   
          game.menu.newGame.el.on('click', game.menu.newGame);  
        },
        loadGame: function(){
          var props = {
            id: 'loadGame', 
            textContent: 'LOAD GAME',
            className: 'button',            
            disabled: true
          };
          game.menu.loadGame.el = game.create('button', props);
          game.menu.add(game.menu.loadGame.el);
        },
        highScore: function(){
          var props = {
            id: 'highScore', 
            className: 'button',         
            textContent: 'HIGHSCORE',
            disabled: true
          }
          game.menu.highScore.el = game.create('button', props);
          game.menu.add(game.menu.highScore.el);     
        },
        github: function(){
          var props = {
            id: 'github', 
            className: 'button',         
            textContent: 'GITHUB'
          }
          game.menu.github.el = game.create('button', props);
          game.menu.github.el.on('click', game.menu.github);
          game.menu.add(game.menu.github.el);     
        },        
        credits: function(){
          var props = {
            id: 'showCredits',
            className: 'button',             
            textContent: 'CREDITS'
          }
          game.menu.credits.el = game.create('button', props);
          game.menu.credits.el.on('click', game.menu.credits);
          game.menu.add(game.menu.credits.el);        
        }
      },

      ///////////////////////////////BUTTON EVENTS///////////////////////////////

      newGame: function(e){ 
        game.noDefault(e);
        game.currentScore = 0;
        game.currentLifes = 2;
        game.currentLevel = 0;
        game.loadLevel(game.currentLevel);
      },   
      loadGame: function(e){
        game.noDefault(e);
        var level = prompt('Select Level:');
        level = parseInt(level);
        if(!isNaN(level) && level > 0 && level < game.level.length){
          game.currentLevel = level;
          game.currentScore = 0;
          game.currentLifes = 2;
          game.loadLevel(level);
        }
      },
      highScore: function(){
        var str = '', sb = game.score.scoreboard;
        sb.sort(function(a, b){return b.score - a.score});
        for (var i = 0; i < sb.length; i++) {
          str += sb[i].name + ': ' + sb[i].score + '\n';
        };
        alert(str);
      },
      github: function(){
        window.location = 'https://github.com/rafaelcastrocouto/arkanoid';
      },
      credits: function(){
        alert([
          'Author:  rafaelcastrocouto',
          'Sounds:  soundjax.com',
          'Fonts:   fontsquirrel.com'
        ].join('\n'))
      }
    },

    ///////////////////////////////LEVEL///////////////////////////////

    loadLevel: function(level){
      game.menu.el.style['display'] = 'none';
      game.css.paint('#478', game.container);
      game.ui.init();   
      game.stage.init();
      game.block.build(level);
      game.ball.build(level); 
      game.pad.init(level);      
      game.mode = 'ready'; 
    },
    nextLevel: function(){
      game.menu.loadGame.el.disabled = false;
      game.menu.loadGame.el.on('click', game.menu.loadGame)
      ++game.currentLevel;
      if(game.currentLevel == game.level.length) game.win();
      else game.loadLevel(game.currentLevel);
    }, 
    level: [
      /*0*/ ['brick','plast','plast','brick','plast','brick','plast','plast','brick',
             'plast','plast','stone','brick','plast','brick','stone','plast','plast'],

      /*1*/ ['brick','plast','plast','brick','plast','brick','plast','plast','brick',
             'stone','stone','stone','plast','stone','plast','stone','stone','stone'],

      /*2*/ ['brick','stone','plast','stone','plast','stone','brick','stone','brick',
             'stone','brick','stone','brick','stone','brick','stone','brick','stone']             
    ],  

    ///////////////////////////////UI///////////////////////////////

    ui: {
      init: function(){
        if(!game.ui.el){
          game.ui.el = game.create('div', {id: 'ui'});
          game.container.add(game.ui.el); 
        } else {    
          game.ui.el.style['display'] = 'block'; 
        }
        game.ui.update();
      },
      update: function(){
        game.ui.el.textContent = '* Score ' + game.currentScore + ' '+
                                 '* Balls ' + game.currentLifes + ' *';
      },
      css: function(){
        game.css.addRule('#ui',{
          'text-shadow': '0 0 '+ game.px(12) +' #ddf',
          'font-size': game.px(30),
          'pading': game.px(6)
        });
      }
    }, 

    ///////////////////////////////SCORE///////////////////////////////

    score: {
      init: function(){
        game.score.scoreboard = [];
        try { game.score.scoreboard = JSON.parse(localStorage.getItem('scoreboard')) }
        catch(e) { console.log('No score detected.') }
        if(game.score.scoreboard){
          if(game.score.scoreboard.length){
            game.score.enable();
          }
        } else game.score.scoreboard = [];
      },
      save: function(){
        localStorage.setItem('scoreboard', JSON.stringify(game.score.scoreboard));
      },
      set: function(name, score){
        game.score.scoreboard.push({name: name, score: score});
        localStorage.setItem('scoreboard', JSON.stringify(game.score.scoreboard));
        game.score.enable();
      },
      enable: function(){
        game.menu.highScore.el.disabled = false;
        game.menu.highScore.el.on('click', game.menu.highScore);
      } 
    },  

    ///////////////////////////////STAGE///////////////////////////////

    stage: {
      init: function(){
        if(!game.stage.el){
          game.stage.el = game.create('div', {id: 'stage'});
          game.container.add(game.stage.el);  
          game.stage.css();
        } else {
          game.clear(game.stage.el);
          game.stage.el.style['display'] = 'block';         
        };    
      },
      css: function(){
        game.stage.height = 0.905 * game.height;
        game.stage.width = 0.945 * game.width;
        game.stage.top = 34;
        game.stage.left = 8;
        game.css.addRule('#stage',{
          'background': '#fff',
          'box-shadow': 'inset 0 0 '+  game.px(20) +' black',
          'height': game.px(game.stage.height),
          'width': game.px(game.stage.width),
          'top':  game.px(game.stage.top),
          'left':  game.px(game.stage.left)
        });        
      },
      add: function(el){
        game.stage.el.appendChild(el);
      } 
    },

    ///////////////////////////////BLOCK///////////////////////////////

    block: {
      init: function(id, className){
        var block = {
          el: game.create('div', {
            id: 'block' + id,
            className: 'block ' + className + ' shadow'
          }),
          i: id,
          hitCount: 0,
          audio: {
            hit: 'hit',
            destroy: 'destroy'
          }                
        };
        switch(className) {
          case 'stone':
            block.life = 5;
            block.color = ['#222','#444','#666','#888','#aaa']
          break;
          case 'brick':
            block.life = 2;
            block.color = ['#b22','#d22']
          break;
          case 'plast':
            block.life = 1;
            block.color = ['#2b2']
          break;
        };
        game.block.css(block);
        game.css.paint(block.color[0], block);
        game.stage.add(block.el);
        return block;   
      }, 
      build: function(level){
        var blocks = game.level[game.currentLevel];
        game.block.array = [];
        for (var i = 0; i < blocks.length; i++) {
          game.block.array.push(game.block.init(i, blocks[i]));
        };
      },    
      css: function(block){ 
        var p = 9;
        var x = (block.i % p);
        var y = Math.floor(block.i/p);

        game.block.width = 95;
        game.block.height = 45;    

        block.x = (x * (game.block.width + p)) + p;
        block.y = ((y * (game.block.height + p)) + p) + 560;
        block.width = game.block.width;
        block.height = game.block.height;

        block.el.style['bottom'] = game.px(block.y);
        block.el.style['left'] = game.px(block.x);

        game.css.addRule('.block', {
          'border-radius': game.px(8),
          'width': game.px(block.width),
          'height': game.px(block.height)
        })        
      }, 
      end: function(block){
        game.stage.el.removeChild(block.el);
        game.block.array.splice(block.i, 1);
      },
      checkCollision: function(ball){
          for (var i = 0; i < game.block.array.length; i++) { 
            var block = game.block.array[i];     
            if(game.collision(ball, block)){
              ++block.hitCount;
              if(block.hitCount == block.life) { //destroy block
                game.audio[block.audio.destroy].play();
                game.currentScore += 10;
                game.ui.update();
                block.i = i;
                game.block.end(block);
              } else { //change block color
                game.audio[block.audio.hit].play();
                game.css.paint(block.color[block.hitCount], block);
                game.currentScore += 1;
                game.ui.update();
              }
              //hit block sides
              if(ball.y > block.y
              && ball.y < block.y + block.height){
                ball.speed.x *= -1;
              } else { //hit block bottom or top
                ball.speed.y *= -1;
              }
            }
          }        
      }
    },

    ///////////////////////////////BALL///////////////////////////////

    ball: {
      radius: 12,
      speed: 6,
      acceleration: 1.01,
      init: function(id, radius){
        if(!id) id = 0;
        if(!radius) radius = game.ball.radius;
        var ball = {
          el : game.create('div', {
            id: 'ball' + id,
            className: 'ball shadow'
          }),
          radius: radius,
          speed: {x: 0, y: 0},
          i: id
        };
        game.stage.add(ball.el);
        return ball;     
      },
      build: function(level){
        var ball = game.ball.init();
        game.ball.array = [ball];  
        switch(level) {
          case 0:
          case 1:
          case 2:
            game.ball.setRadius();
            game.css.paint('#244', ball);
          break;
        };
        game.ball.position();
        game.ball.css(ball);
      },
      position: function(){
        game.ball.moveTo({
          x: (game.width / 2) - (game.ball.radius / 2), 
          y: 32
        });        
      },
      end: function(ball){
        game.stage.el.removeChild(ball.el);
        game.ball.array.splice(ball.i, 1);
      },   
      launch: function(){
        if(game.mode == 'ready'){
          game.mode = 'playing'; 
          game.ball.array[0].speed.x = game.pad.speed / 10;
          game.ball.array[0].speed.y = game.ball.speed;
          game.ball.move(); 
        }
      },   
      setRadius: function(r, ball){
        if(!ball) ball = game.ball.array[0];
        if(!r) r = game.ball.radius;
        ball.radius = r;
        ball.el.style['width'] = game.px(2 * r);        
        ball.el.style['height'] = game.px(2 * r);   
      },
      moveTo: function(o, ball){
        if(!ball) ball = game.ball.array[0];
        ball.x = o.x;
        ball.el.style['left'] = game.px(o.x);
        if(o.y){
          ball.y = o.y;
          ball.el.style['bottom'] = game.px(o.y);
        }
      },
      followPad: function(){ 
        var x = game.pad.x;
        var offset = (game.pad.width / 2) - (game.ball.radius);
        game.ball.array[0].x = x + offset;
        game.ball.array[0].el.style['left'] = game.px(x + offset)
      },
      move: function(){
        for (var b = 0; b < game.ball.array.length; b++) {
          var ball = game.ball.array[b];
          //predict next position
          if(isNaN(ball.speed.x)) throw new Error(''+i);
          ball.nx = ball.x + ball.speed.x;
          ball.ny = ball.y + ball.speed.y;
          //hit sides
          if(ball.nx > game.stage.width - (ball.radius * 2)
          || ball.nx < 0){ 
            ball.speed.x *= -1;
          }
          //hit top
          if(ball.ny > game.stage.height - 30){  
            ball.speed.y *= -1;
          }
          //hit pad
          game.pad.checkCollision(ball);
          //hit blocks
          game.block.checkCollision(ball);

          //hit bottom
          if (ball.y < 0) {
            ball.i = b;
            game.ball.end(ball);
          }
          //keep moving
          else {
              game.ball.moveTo({
              x: ball.x + ball.speed.x,
              y: ball.y + ball.speed.y
            }); 
          }
        }
        if(game.block.array.length == 0) game.nextLevel();
        if(game.ball.array.length  == 0) game.ball.restart();
        if(game.currentLifes  == 0) game.over();
        if(game.mode == 'playing') game.loop(game.ball.move)
      },
      restart: function(){
        --game.currentLifes;
        if(game.currentLifes == 1) game.css.paint('#a66');
        game.ui.update();
        game.ball.build(game.currentLevel);
        game.pad.init();
        game.mode = 'ready';
      },
      css: function(ball){ 
        ball.el.style['bottom'] = game.px(ball.y);
        ball.el.style['left'] = game.px(ball.x);
        ball.el.style['width'] = game.px(ball.radius * 2);
        ball.el.style['height'] = game.px(ball.radius * 2); 
        ball.el.style['border-radius'] = game.px(ball.radius);             
      },
    },

    ///////////////////////////////PADD///////////////////////////////

    pad: {
      init: function(level){
        if(!game.pad.el) game.pad.el = game.create('div', {
          id: 'pad',
          className: 'shadow'
        });
        game.stage.add(game.pad.el);
        game.pad.speed = 0;
        game.pad.key = 0;
        switch(level) {
          case 0:
            game.pad.setWidth(game.pad.width);
          break; 
          case 1:
            game.pad.setWidth(120);
          break;          
          case 2:
            game.pad.setWidth(100);
          break;
        }
        game.pad.css();
        game.pad.position();
      },
      position: function(){
        var x = (game.width / 2) - (game.pad.width / 2);
        game.pad.x = game.round(game.convert * x);
        game.pad.el.style['left'] = game.px(x);
      },      
      inLimit: function(x){
        if(x < 0) x = 0;
        var offset = (game.stage.el.offsetWidth - game.pad.el.offsetWidth) / game.convert;
        if(x > offset) x = offset;
        return x;
      },
      keyboardMove: function(k){
        game.pad.key = k;
        var x = game.pad.x + 15 * k;
        game.pad.x = game.pad.inLimit(x);
      },
      mouseMove: function(mx){
        var offset = (game.container.el.offsetLeft + game.stage.el.offsetLeft + (game.pad.el.offsetWidth / 2)) / game.convert;
        var x = mx - offset;
        game.pad.moveTo(game.pad.inLimit(x));
      },
      moveTo: function(x){ 
        var s = x - game.pad.x;
        if(s > 100) s = 100;
        if(s < -100) s = -100;
        game.pad.speed = s;
        game.pad.x = x;
        game.pad.el.style['left'] = game.px(x);       
      },
      setWidth: function(w){
        game.pad.width = w;
        game.pad.el.style['width'] = game.px(w);        
      },
      checkCollision: function(ball){
        if(game.collision(ball, game.pad)){ 
          game.audio.hit.play();
          //hit pad sides
          if(ball.y < game.pad.y + game.pad.height){
            if((ball.speed.x > 0 && game.pad.speed < 0)
            || (ball.speed.x < 0 && game.pad.speed > 0)){
              ball.speed.x *= -1;  
            } else {
              ball.speed.x *= 2;
            }
          } else { //hit pad top
            var dx = ball.x + ball.radius - game.pad.x - (game.pad.width / 2);
            ball.speed.x += dx / 40
          }
          ball.speed.y *= -1 * game.ball.acceleration;
        }
      },
      css: function(){ 
        game.pad.height = 20;
        game.pad.width = 140;
        game.pad.y = 10;

        game.pad.el.style['width'] = game.px(game.pad.width);
        game.pad.el.style['left'] =  game.px(game.pad.x);

        game.css.addRule('#pad', {
          'background': '#789',
          'border-radius':  '50% 50% 0 0',
          'height': game.px(game.pad.height),
          'bottom': game.px(game.pad.y)
        }); 
      }
    },    

    ///////////////////////////////COLLISION///////////////////////////////

    collision: function (ball, block) {
      var distance = 0;
      if (ball.nx + ball.radius < block.x) {
        distance += Math.pow(block.x - ball.nx - ball.radius, 2);
      } else if (ball.nx > block.x + block.width) {
        distance += Math.pow(ball.nx + ball.radius - block.x - block.width, 2);
      } 
      if (ball.ny + ball.radius < block.y) {
        distance += Math.pow(block.y - ball.ny - ball.radius, 2);
      } else if (ball.ny > block.y + block.height) {
        distance += Math.pow(ball.ny + ball.radius - block.y - block.height, 2); 
      } 
      return distance <= Math.pow(ball.radius, 2);
    },

    ///////////////////////////////EVENTS///////////////////////////////

    events: {
      init: function(){
        var on;
        if(window.attachEvent) {
          on = function(evt, f){ this.attachEvent(evt, f) }
        } else if(window.addEventListener) {
          on = function(evt, f){ this.addEventListener(evt, f) }
        } else on = function(evt, f){ this['on'+s] = f };
        game.on = on;
        window.on = on;
        document.on = on;
        document.body.on = on;
        game.css.events();
        game.mouse.events();
        game.touch.events();
        game.keyboard.events();
      }
    },

    ///////////////////////////////MOUSE///////////////////////////////

    mouse: {
      events: function(){
        window.on('mousemove', game.mouse.move);
        window.on('click', game.mouse.click);
        window.on('dblclick', function(){return false});
      },
      click: function(e){ 
        game.noDefault(e);
        game.ball.launch(); 
      },      
      move: function(e){  
        var isReady = (game.mode == 'ready');
        var isPlaying = (isReady || game.mode == 'playing');        
        if(isPlaying){
          game.pad.mouseMove(e.clientX / game.convert);
          if(isReady) game.ball.followPad();
        }
      }  
    },

    ///////////////////////////////TOUCH///////////////////////////////

    touch:{
      events: function(){
        game.touchable = 'createTouch' in document;
        game.touches = [];
        window.on('touchmove', game.touch.move);
        window.on('touchstart', game.touch.move);
        window.on('touchend', game.touch.move);
        window.on('gesturemove', game.touch.move);
        window.on('gesturemovestart', game.touch.move);
        window.on('gesturemoveend', game.touch.move);
        game.touch.loop();
      },
      loop: function(){
        var isReady = (game.mode == 'ready');
        var isPlaying = (isReady || game.mode == 'playing');
        if(isPlaying){
          var e = game.touches[0];
          if(e && e.clientX){
            game.pad.mouseMove(e.clientX / game.convert);
            if(isReady) game.ball.followPad();
          }
        }
        game.loop(game.touch.loop);
      },
      move: function(e){
        e.preventDefault();
        game.touchable = 1;
        game.touches = e.touches;
      }
    },


    ///////////////////////////////KEYBOARD///////////////////////////////

    keyboard: {
      events: function(){
        window.on('selectstart', function(){return false});
        window.on('keydown', game.keyboard.down);
        window.on('keyup', game.keyboard.up);
        game.date = (new Date).getTime();
        game.keyboard.loop();
      },    
      down: function(e){
        var key = e.which || e.keyCode;
        switch (key) { 
          case 80: // P
            game.noDefault(e);
            game.pause();
          break;
          case 32: // Space
            game.noDefault(e);
            game.ball.launch(game.ball.first);
          break;
          case 37: // Left arrow
          case 65: // A
            game.noDefault(e);
            game.pad.key = -1;
            game.pad.speed = -100; 
          break;
          case 39: // Right arrow
          case 68: // D
            game.noDefault(e);
            game.pad.key = 1; 
            game.pad.speed = 100;
          break;
          default:
            //console.log(key)
          break;
        };
        return game.mode;
      },
      up: function(e){
        var key = e.which || e.keyCode;
        switch (key) {
          case 37: // Left arrow
          case 65: // A          
          case 39: // Right arrow
          case 68: // D
            game.noDefault(e); 
            game.pad.key = 0;
            game.pad.speed = 0;
          break;          
        }
      },
      loop: function(){ 
        var isReady = (game.mode == 'ready');
        var isPlaying = (isReady || game.mode == 'playing');
        game.keyboard.delay = 0;
        while ((new Date).getTime() > game.date) { 
          if(game.pad.key && isPlaying) game.pad.keyboardMove(game.pad.key);
          game.date += game.rate;
          ++game.keyboard.delay;
        } 
        if(game.pad.key && game.keyboard.delay && isPlaying) game.pad.el.style['left'] = game.px(game.pad.x); 
        if(game.pad.key && isReady) game.ball.followPad(); 
        game.loop(game.keyboard.loop)
      } 
    },  
    pause: function(){
      if(game.mode != 'paused' && game.mode != 'menu'){ // PAUSE
        game.lastMode = game.mode;
        game.mode = 'paused';
        game.ui.el.textContent = '* PAUSED *'
        game.css.paint('#222');
      } else { // UNPAUSE
        game.mode = game.lastMode;
        game.ui.update();
        if(game.mode == 'playing') game.ball.move();
        game.css.paint('#bbb');
      }
    },    

    noDefault: function(event){
      event.stopPropagation();
      event.preventDefault();
    },

    ///////////////////////////////LOOP///////////////////////////////

    loop: function(f, r){ 
      var animationFrame = window.requestAnimationFrame 
                        || window.mozRequestAnimationFrame 
                        || window.webkitRequestAnimationFrame 
                        || window.msRequestAnimationFrame
                        || window.setTimeout;
      var cancelAnimation  = window.cancelAnimationFrame 
                        || window.mozCancelAnimationFrame
                        || window.webkitCancelRequestAnimationFrame 
                        || window.msCancelRequestAnimationFrame
                        || window.clearTimeout; 
      if(f.timeout) cancelAnimation(f.timeout);
      f.timeout = animationFrame(f, r || game.rate) 
    },

    ///////////////////////////////AUDIO///////////////////////////////

    audio: {
      list: [ 'hit', 'destroy' ],
      init: function(){
        var l = game.audio.list;
        for (var i = 0; i < l.length; i++) {
          var name = l[i];
          
          if(window.location.host == "rafaelcastrocouto.jsapp.us") game.audio[name] = game.create('audio', {src: 'http://sites.google.com/site/rafaelcastrocouto/download/arkanoid/'+ name +'.wav'});
          else game.audio[name] = game.create('audio', {src: 'audio/'+ name +'.wav'});

          game.add(game.audio[name]);          
        };
      }
    },

    ///////////////////////////////END///////////////////////////////

    win: function(){
      game.css.paint('288');
      var name = prompt('You Win!\nScore: ' + game.currentScore + '\nEnter your name:');
      game.end(name);
    },
    over: function(){
      game.css.paint('#d22');
      var name = prompt('Game Over!\nScore: ' + game.currentScore + '\nEnter your name:');
      game.end(name);
    },
    end: function(name){
      if(!name) name = 'Anonymous';
      game.score.set(name, game.currentScore);
      game.ui.el.style['display'] = 'none';
      game.stage.el.style['display'] = 'none';
      game.menu.el.style['display'] = 'block';
      game.mode = 'menu';
      game.currentLevel = 0;   
      game.css.paint('#bbb');
      game.css.paint('#69a', game.container);
    }
  };
  this.game = game;
};
var arkanoid = new Game();
arkanoid.game.init()

