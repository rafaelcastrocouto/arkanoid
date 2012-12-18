window.addEventListener('load', function(){
  var game = {
    init: function(){
      game.mode = 'menu';
      game.fps = 50;
      game.rate = 1000 / game.fps;
      game.width = document.body.clientWidth * 0.8;
      game.height = game.width * 0.6;
      game.un = game.width / 1000;
      game.container.init();
      game.menu.init();
      game.score.init();
      game.audio.init();
      game.update.init();
      game.paint(document.body, '#bbb');
      game.keyboard.events();
    },
    create: function(t, props){
      var el = document.createElement(t);
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
    /////////////////CONTAINER/////////////////

    container: {
      init: function(){
        game.container.el = game.create('div', {id: 'container'});
        game.add(game.container.el);       
        game.container.el.style['border-radius'] = (5 * game.un) + 'px';
        game.container.el.style['box-shadow'] = '0 0 ' + (15 * game.un) + 'px black';
        game.container.el.style['height'] = game.height + 'px';
        game.container.el.style['width'] = game.width + 'px';
        game.container.el.style['top'] = ((document.body.clientHeight / 2) - (game.height / 2)) + 'px';
        game.paint(game.container.el, '#69a');
      },
      add: function(el){
        game.container.el.appendChild(el);
      } 
    },
    stage: {
      init: function(){
        if(game.stage.el){
          game.stage.clear();
        } else {
          game.stage.el = game.create('div', {id: 'stage'});
          game.container.add(game.stage.el);  
          game.stage.el.style['height'] = (game.height - (32 * game.un)) + 'px';
          game.stage.el.style['width'] = (game.width - (4 * game.un)) + 'px';
          game.stage.el.style['left'] = (2 * game.un) + 'px';
          game.stage.el.style['top'] = (2 * game.un) + 'px';
          game.stage.el.style['box-shadow'] = 'inset 0 0 '+ (20 * game.un) +'px black';
          game.paint(game.stage.el, '#fff');  
        };    
        game.stage.el.style['display'] = 'block';
      },
      add: function(el){
        game.stage.el.appendChild(el);
      },   
      clear: function(){
        game.clear(game.stage.el);
      }  
    },

    ui: {
      init: function(){
        if(!game.ui.el){
          game.ui.el = game.create('div', {id: 'ui'});
          game.ui.el.style['border-radius'] = 8 * game.un + 'px';
          game.ui.el.style['text-shadow'] =  '0 0 '+ 8 * game.un +'px #ddf';
          game.ui.el.style['font-size'] = 18 * game.un + 'px';
          game.container.add(game.ui.el); 
        }  
        game.ui.el.style['display'] = 'inline-block'; 
        game.ui.update();
      },
      update: function(){
        game.ui.el.textContent = '* Score ' + game.currentScore + ' '+
                                 '* Balls ' + game.currentLifes + ' *';
      }
    }, 

    /////////////////MENU/////////////////

    menu: {
      init: function(){
        game.menu.el = game.create('div', {id: 'menu'});
        game.container.add(game.menu.el);
        game.menu.addButtons();   
        game.menu.el.style['top'] = (game.height / 2) - (game.menu.el.offsetHeight / 2) + 'px';
      },
      add: function(el){
        game.menu.el.appendChild(el);
      },  
      addButtons: function(){
        game.menu.newGame();
        game.menu.loadGame();
        game.menu.showScore();
        game.menu.showCredits();            
      },
      newGame: function(){
        var props = {
          id: 'newGame', 
          textContent: 'NEW GAME'
        }
        game.menu.newGame.el = game.create('button', props);
        game.menu.newGame.el.style['font-size'] = 32 * game.un + 'px';
        game.menu.newGame.el.addEventListener('click', game.newGame);
        game.menu.add(game.menu.newGame.el);        
      },
      loadGame: function(){
        var props = {
          id: 'loadGame', 
          textContent: 'LOAD GAME',
          disabled: true
        }
        game.menu.loadGame.el = game.create('button', props);
        game.menu.loadGame.el.style['font-size'] = 30 * game.un + 'px';
        game.menu.add(game.menu.loadGame.el);         
      },
      showScore: function(){
        var props = {
          id: 'showScore', 
          textContent: 'HIGHSCORE',
          disabled: true
        }
        game.menu.showScore.el = game.create('button', props);
        game.menu.showScore.el.style['font-size'] = 30 * game.un + 'px';
        game.menu.add(game.menu.showScore.el);        
      },
      showCredits: function(){
        var props = {
          id: 'showCredits', 
          textContent: 'CREDITS'
        }
        game.menu.showCredits.el = game.create('button', props);
        game.menu.showCredits.el.style['font-size'] = 30 * game.un + 'px';
        game.menu.showCredits.el.addEventListener('click', function(){
          alert([
            'Author:  rafaelcastrocouto',
            'Sounds:  soundjax.com',
            'Fonts:   fontsquirrel.com'
          ].join('\n'))
        });
        game.menu.add(game.menu.showCredits.el);        
      }

    },

    /////////////////NEW GAME/////////////////

    newGame: function(e){
      game.noDefault(e);
      game.currentScore = 0;
      game.currentLifes = 2;
      game.currentLevel = 0;
      game.loadLevel(game.currentLevel);
    },
    loadLevel: function(level){
      game.menu.el.style['display'] = 'none';
      game.paint(game.container.el, '#367');
      game.ui.init();   
      game.stage.init();
      game.padd.init(level);
      game.block.build(level);
      game.ball.build(level);       
      game.mouse.events();
      game.loop.animate(game.update.frame); 
      game.mode = 'ready'; 
    },
    nextLevel: function(){
      game.menu.loadGame.el.disabled = false;
      game.menu.loadGame.el.addEventListener('click', game.loadGame)
      ++game.currentLevel;
      if(game.currentLevel == game.level.length) game.win();
      else game.loadLevel(game.currentLevel);
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
    newBall: function(){
      --game.currentLifes;
      if(game.currentLifes == 1) game.paint(document.body, '#a66');
      game.ui.update();
      game.ball.build(game.currentLevel);
      game.padd.init('reset');
      game.mode = 'ready';
    },
    /////////////////PADD/////////////////

    padd: {
      init: function(level){
        if(level != 'reset'){
          game.padd.el = game.create('div', {id: 'padd'});
          game.stage.add(game.padd.el);
        }
        switch(level) {
          case 'reset':
          case 0:
          case 1:
          case 2:
            game.padd.speed = 32 * game.un;
            game.padd.lastSpeed = 0;
            game.padd.key = 0;
            game.padd.width = (140 * game.un);
            game.padd.height = (20 * game.un);
            game.padd.x = (game.width / 2) - (game.padd.width / 2);
            game.padd.y = (10 * game.un);
            game.padd.el.style['width'] = game.padd.width + 'px';
            game.padd.el.style['height'] = game.padd.height + 'px';
            game.padd.el.style['bottom'] = game.padd.y + 'px';
            game.padd.el.style['left'] = game.padd.x + 'px';
            game.padd.el.style['display'] = 'block';
            game.paint(game.padd.el, '#789');
          break;
        }
      },
      moveTo: function(x){
        game.padd.x = x;
        game.padd.el.style['left'] = x + 'px';
      },
      inLimit: function(x){
        return (x > 1 && x < (game.width - game.padd.width - (5 * game.un)));
      },
      move: function(k){
        game.padd.key = k;
        var x = game.padd.x + game.padd.speed * k * 0.5;
        if(game.padd.inLimit(x)){
          game.padd.x = x;
        }
      },
      checkCollision: function(ball){
        if(game.collision(ball, game.padd)){ 
          game.audio.hit.play();
          //hit padd sides
          if(ball.y < game.padd.y + game.padd.height){
            if((ball.speed.x > 0 && game.padd.lastSpeed < 0)
            || (ball.speed.x < 0 && game.padd.lastSpeed > 0)){
              ball.speed.x *= -1;  
            } else {
              ball.speed.x *= 2;
            }
          } else { //hit padd top
            var dx = ball.x + ball.radius - game.padd.x - (game.padd.width / 2);
            ball.speed.x += dx / (40 * game.un)
          }
          ball.speed.y *= -1 * game.ball.acceleration;
        }
      }
    },

    /////////////////LEVEL/////////////////

    level: [
      /*0*/ ['brick','brick','stone','brick','brick','brick','stone','brick','brick',
             'plast','plast','stone','brick','brick','brick','stone','plast','plast'],

      /*1*/ ['brick','plast','stone','brick','brick','brick','stone','plast','brick',
             'stone','stone','stone','brick','stone','brick','stone','stone','stone'],

      /*2*/ ['stone','plast','plast','plast','plast','plast','plast','plast','stone',
             'stone','plast','plast','plast','plast','plast','plast','plast','stone']             
    ],    

    /////////////////BLOCK/////////////////

    block: {
      init: function(x, className){
        var block = {
          el: game.create('div', {className: 'block ' + className}),
          width: (100 * game.un),
          height: (40 * game.un),
          i: x,
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
        var p = (10 * game.un);
        if(x < 9) {
          block.x = (x * (block.width + p)) + p;
          block.y = game.height - (85 * game.un);
        } else {
          block.x = ((x - 9) * (block.width + p)) + p;
          block.y = game.height - (135 * game.un);
        }
        block.el.style['border-radius'] = 8 * game.un + 'px';
        block.el.style['width'] = block.width + 'px';
        block.el.style['height'] = block.height + 'px';
        block.el.style['bottom'] = block.y + 'px';
        block.el.style['left'] = block.x + 'px';
        game.paint(block.el, block.color[0]);
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
                game.paint(block.el, block.color[block.hitCount]);
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

    /////////////////BALL/////////////////

    ball: {
      init: function(id, size){
        var ball = {
          el : game.create('div', {className: 'ball'}),
          size: size,
          speed: { x: 0, y: 0}          
        };
        ball.radius = ball.size / 2;
        ball.el.style['width'] = ball.size + 'px';
        ball.el.style['height'] = ball.size + 'px';
        ball.el.style['display'] = 'block';
        game.paint(ball.el, '#244');
        game.stage.add(ball.el);
        return ball;     
      },
      build: function(level){
        switch(level) {
          case 0:
          case 1:
          case 2:
            game.ball.startRadius = (12 * game.un);
            game.ball.startSpeed = 6 * game.un;
            game.ball.acceleration = 1.01; 
            game.ball.first = game.ball.init(0, game.ball.startRadius * 2);    
            game.ball.first.i = 0; 
            var o = {
              x: (game.width / 2) - game.ball.startRadius, 
              y: game.padd.height + game.padd.y + game.un
            };
            game.ball.moveTo(o, game.ball.first);
            game.ball.array = [game.ball.first];
          break;
        }
      },
      end: function(ball){
        game.stage.el.removeChild(ball.el);
        game.ball.array.splice(ball.i, 1);
      },   
      launch: function(){
        if(game.mode == 'ready'){
          game.mode = 'playing'; 
          var x = 0;
          var ls = game.padd.lastSpeed
          if(ls) x = ls;
          game.ball.first.speed.x = x / (10 * game.un);
          game.ball.first.speed.y = game.ball.startSpeed;
          game.ball.move(); 
        }
      },   
      moveTo: function(o, ball){
        ball.x = o.x;
        ball.el.style['left'] = o.x + 'px';
        if(o.y){
          ball.y = o.y;
          ball.el.style['bottom'] = o.y + 'px';
        }
      },
      move: function(){
        for (var b = 0; b < game.ball.array.length; b++) {
          var ball = game.ball.array[b];
          //predict next position
          if(isNaN(ball.speed.x)) throw new Error(''+i);
          ball.nx = ball.x + ball.speed.x;
          ball.ny = ball.y + ball.speed.y;
          //hit sides
          if(ball.nx > game.width  - ball.size 
          || ball.nx < 0){ 
            ball.speed.x *= -1;
          }
          //hit top
          if(ball.ny > game.height - (60 * game.un)){  
            ball.speed.y *= -1;
          }
          //hit padd
          game.padd.checkCollision(ball);
          //hit blocks
          game.block.checkCollision(ball);

          //hit bottom
          if (ball.y < 0) {
            ball.i = b;
            game.ball.end(ball);
          }
          //keep moving
          else {
            var o = {
              x: ball.x + ball.speed.x,
              y: ball.y + ball.speed.y
            }
            game.ball.moveTo(o, ball); 
          }
        }
        if(game.block.array.length == 0) game.nextLevel();
        if(game.ball.array.length  == 0) game.newBall();
        if(game.currentLifes  == 0) game.over();
        if(game.mode == 'playing') game.loop.runAgain(game.ball.move)
      }
    },

    /////////////////COLLISION/////////////////

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

    /////////////////PAINT/////////////////

    paint: function(el, color){
      el.style['background'] = color;
      var c = {
        r: parseInt(color[1], 16) - 6,
        g: parseInt(color[2], 16) - 6,
        b: parseInt(color[3], 16) - 6
      }
      if(c.r < 0) c.r = 0;
      if(c.g < 0) c.g = 0;
      if(c.b < 0) c.b = 0;
      var color2 = '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
      el.style['background'] = '-webkit-radial-gradient(center, ellipse cover, '+color+' 0%,'+color2+' 100%)'; 
      el.style['background'] = '-moz-radial-gradient(center, ellipse cover, '+color+' 0%,'+color2+' 100%)'; 
    },

    /////////////////SCORE/////////////////

    score: {
      show: function(){
        var str = '', sb = game.score.scoreboard;
        sb.sort(function(a, b){return b.score - a.score});
        for (var i = 0; i < sb.length; i++) {
          str += sb[i].name + ': ' + sb[i].score + '\n';
        };
        alert(str);
      },
      init: function(){
        try { game.score.scoreboard = JSON.parse(localStorage.getItem('scoreboard')) }
        catch(e) { game.score.scoreboard = [];}
        if(game.score.scoreboard.length){
          game.score.enable();
        }
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
        game.menu.showScore.el.disabled = false;
        game.menu.showScore.el.addEventListener('click', game.score.show);
      } 
    },

    /////////////////MOUSE/////////////////

    mouse: {
      events: function(){
        window.addEventListener('mousemove', game.mouse.move);
        window.addEventListener('click', game.mouse.click);
      },
      click: function(e){ 
        game.noDefault(e);
        game.ball.launch(); 
      },      
      move: function(e){ 
        var ex = e.webkitMovementX || e.mozMovementX;
        if(!ex) ex = e.clientX - game.padd.x;
        if(ex > 0 && ex > game.padd.speed) 
          ex = game.padd.speed;
        if(ex < 0 && ex < -game.padd.speed) 
          ex = -game.padd.speed;        
        var x = game.padd.x + ex;
        var m = game.padd.width / 2;
        if(game.padd.inLimit(x)){
          if(game.mode == 'ready') 
            game.ball.moveTo({x: x - game.ball.first.radius + m}, game.ball.first);
          if(game.mode == 'ready' || game.mode == 'playing')
            game.padd.moveTo(x);
        }  
        game.padd.lastSpeed = ex; 
        game.loop.runAgain(function(){
          game.padd.lastSpeed = 0; 
        }, 100)
      }   
    },

    /////////////////KEYBOARD/////////////////

    keyboard: {
      events: function(){
        window.addEventListener('keydown', game.keyboard.down);
        window.addEventListener('keyup', game.keyboard.up);
        document.onselectstart = function(){return false};
      },
      down: function(e){
        switch (e.which) { 
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
            game.padd.key = -1; 
          break;
          case 39: // Right arrow
          case 68: // D
            game.noDefault(e);
            game.padd.key = 1; 
          break;
          default:
            if(game.block.array && game.block.array.length > 0){
              var block = game.block.array[0];
              block.i = 0;
              game.block.end(block)
            }
          break;
        };
        return game.mode;
      },
      up: function(e){
        switch (e.which) {
          case 37: // Left arrow
          case 65: // A          
          case 39: // Right arrow
          case 68: // D
            game.noDefault(e); 
            game.padd.key = 0;
          break;          
        }
      }
    },

    noDefault: function(event){
      event.stopPropagation();
      event.preventDefault();
    },

    /////////////////LOOP/////////////////

    loop: {
      runAgain: function(f){
        if(f.timeout) clearTimeout(f.timeout);  
        f.timeout = setTimeout(f, game.rate);
      },
      animate: (function(){
        var animationFrame = window.webkitRequestAnimationFrame 
                          || window.mozRequestAnimationFrame;
        if(animationFrame) {
          return function(f) {
            var callback = function(){ f(); animationFrame(callback) };
            callback();
          }
        } else {
          return function(f) {
            setInterval(f, 0);
          }
        }
      })()
    },
    update:{ 
      init: function(){ 
        game.date = (new Date).getTime();
        game.update.frame = function(){ 
          game.loop.count = 0;
          while ((new Date).getTime() > game.date) {
            if(game.padd.key){
              if(game.mode == 'ready' || game.mode == 'playing')
                game.padd.move(game.padd.key);
              if(game.mode == 'ready') {
                var x = game.padd.x;
                var m = game.padd.width / 2;                 
                game.ball.first.x = x - game.ball.first.radius + m;
              }
            }
            game.date += game.rate;
            ++game.loop.count;
          }
          if(game.loop.count) {
            game.ball.moveTo({x: game.ball.first.x}, game.ball.first);              
            game.padd.moveTo(game.padd.x);
          }
        }
      }
    },

    pause: function(){
      if(game.mode != 'paused' && game.mode != 'menu'){ // PAUSE
        game.lastMode = game.mode;
        game.mode = 'paused';
        game.ui.el.textContent = '* PAUSED *'
        game.paint(document.body, '#222');
      } else { // UNPAUSE
        game.mode = game.lastMode;
        game.ui.update();
        if(game.mode == 'playing') game.ball.move();
        game.paint(document.body, '#bbb');
      }
    },
    /////////////////AUDIO/////////////////

    audio: {
      list: [ 'hit', 'destroy' ],
      init: function(){
        var l = game.audio.list;
        for (var i = 0; i < l.length; i++) {
          var name = l[i];
          game.audio[name] = game.create('audio', {src: 'audio/'+ name +'.wav'});
          game.add(game.audio[name]);          
        };
      }
    },

    /////////////////END/////////////////

    win: function(){
      game.paint(document.body, '288');
      var name = prompt('You Win!\nScore: ' + game.currentScore + '\nEnter your name:');
      game.end(name);
    },
    over: function(){
      game.paint(document.body, '#d22');
      var name = prompt('Game Over!\nScore: ' + game.currentScore + '\nEnter your name:');
      game.end(name);
    },
    end: function(name){
      if(!name) name = 'Anonymous';
      game.score.set(name, game.currentScore);
      game.stage.clear();
      game.ui.el.style['display'] = 'none';
      game.stage.el.style['display'] = 'none';
      game.menu.el.style['display'] = 'inline-block';
      game.mode = 'menu';
      game.currentLevel = 0;   
      game.paint(document.body, '#bbb')   
    }
  };
  game.init(); 
  window.game = game;
});