var Game = function(){ 
  var game = {
    init: function(){ 
      game.fps = game.properties.fps || 50;
      game.rate = 1000 / game.fps;
      game.level = game.properties.levels || [['brick','brick','brick','brick','brick','brick','brick','brick','brick']]; 
      //LOAD ORDER
      game.events.init();
      game.css.init();
      game.container.init();
      game.intro.show();      
      game.audio.init();      
    },
    intro: {
      show: function(){
        if(game.properties.intro){
            game.css.addRule('#intro', {            
              'width': game.px(game.container.width),
              'font-size': game.px(game.container.height/6),
              'top': game.px(game.container.height/2.166)
            });  
            game.intro.el = game.create('div', {id: 'intro'});
            var logo = game.properties.intro.title || 'Game', 
                spans = [];
            for(var i = 0; i < logo.length ; i++){
              spans.push('<span>'+logo[i]+'</span>');
            }
            game.css.addRule('#intro span', { 
              '-webkit-animation': 'intro '+game.properties.intro.duration+'s infinite linear',
              '-moz-animation': 'intro '+game.properties.intro.duration+'s infinite linear',
              '-o-animation': 'intro '+game.properties.intro.duration+'s infinite linear',
              'animation': 'intro '+game.properties.intro.duration+'s infinite linear'
             });  
            game.intro.el.innerHTML = spans.join('');
            game.container.add(game.intro.el);
            setTimeout(game.intro.hide, game.properties.intro.duration * 1000 || 3000);
        } else game.menu.init();
      },
      hide: function(){
        game.intro.el.style.display = 'none';
        game.menu.init()
      }
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
    changeMode: function(mode){
      switch (mode) {
        case 'menu':
          game.menu.el.style['display'] = 'block';
        break;
        case 'ready':
          game.date = (new Date).getTime();
          game.events.loop();
        break;
        case 'playing': 
          game.loop(game.ball.move);
          game.loop(game.power.move);
        break;
      }
      game.mode = mode;
    },

    ///////////////////////////////STYLE///////////////////////////////

    css: {
      init: function(){
        game.width = game.properties.width || 400;
        game.height = game.properties.height || 300;  
        var el = game.create('style',{id: 'rules'}); 
        game.add(el);
        game.css.el = el;
        game.css.resize();
        game.css.font();
        game.css.paint('#bbb');
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
          '.shadow' : {
            'box-shadow': '0px 0px ' + game.px(15) + ' black'
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
        game.css.updatePowers();
      },
      updatePowers: function(){
        if(game.power) {
          var powers = game.power.array;
          if(powers && powers.length > 0) {
            for(var p in powers) game.power.css(powers[p]);
          }
        }    
      },
      updateBlocks: function(){
        if(game.block) {
          var blocks = game.block.array;
          if(blocks && blocks.length > 0) {
            for(var b in blocks) game.block.css(blocks[b]);
          }
        }        
      },
      updateBalls: function(){
        if(game.ball) {
          var balls = game.ball.array;
          if(balls && balls.length > 0) {
            for(var b in balls) game.ball.css(balls[b]);
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
        var el, w;
        var bkg = game.css.background(color);
        if(!obj) {
          el = document.body;
          w = game.width;
        }
        else if(obj.el) {
          el = obj.el;
          w = obj.width || obj.radius;
        }
        el.style['background'] = color;
        el.style['box-shadow'] = '0 0 '+game.px(10)+' black';
        var color2 = game.css.dark(color);
        el.style['background-image'] = '-webkit-radial-gradient(center, ellipse cover, '+color+' 50%,'+color2+' 100%)';
      },
      dark: function(color, inv){
        if(!inv) inv = 1;
        var c = {
          r: parseInt(color[1], 16) + (6 * -inv),
          g: parseInt(color[2], 16) + (6 * -inv),
          b: parseInt(color[3], 16) + (6 * -inv)
        };
        if(c.r < 0) c.r = 0; if(c.r > 15) c.r = 15; 
        if(c.g < 0) c.g = 0; if(c.g > 15) c.g = 15; 
        if(c.b < 0) c.b = 0; if(c.b > 15) c.b = 15;

        return '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);

      },
      background: function(color){
        var color2 = game.css.dark(color);
        var bkg = [ 
          color, 
          '-webkit-radial-gradient(center, ellipse cover, '+color+' 0%,'+color2+' 100%)'
        ];
        return bkg;
      },
      font: function() {
        if(game.properties.fonts){
          var el = game.create('style',{id: 'font'}); 
          game.add(el);
          game.css.font.el = el;        
          var css = [];
          for(f in game.properties.fonts){
            var font = game.properties.fonts[f];
            var str = [
              '@font-face{', 
              '  font-family: \''+ font + '\';',
              '  src: url(\'font/'+font+'.eot\' ),',
              '       url(\'font/'+font+'.ttf\' ),',
              '       url(\'font/'+font+'.woff\');',
              '}'
            ];
            css.push(str.join('\n'));
          }
          game.css.font.el.textContent = css.join('\n');
        }
      }
    },

    ///////////////////////////////CONTAINER///////////////////////////////

    container: {
      init: function(){
        game.container.el = game.create('div',{
          id: 'container'
        });
        game.add(game.container.el);  
        game.container.css();
        game.css.paint('#69a', game.container);
      },
      css: function(){
        game.container.height = (game.height * 0.96);
        game.container.width = (game.width * 0.96);
        game.container.top = (game.window.height / 2) - (game.height * 0.95 / 2);
        game.container.left = (game.window.width / 2) - (game.width * 0.95 / 2);        
        game.css.addRule('#container', {            
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
        if(!game.menu.el){
          game.menu.el = game.create('div', {id: 'menu'});
          game.container.add(game.menu.el);
          game.menu.addButtons();  
        }
        game.menu.css();
        game.changeMode('menu');
        game.score.init();
      },    
      css: function(){
        game.menu.width = 300;
        game.menu.height = 460;
        game.menu.left = (game.width / 2) - (game.menu.width / 2);
        game.menu.top = (game.height / 2) - (game.menu.height / 2);

        var color1 = ' rgb(150, 150, 170)',
            color2 = ' rgb(180, 180, 200)',
            color3 = ' rgb(130, 130, 150)',
            color4 = ' rgb(190, 190, 210)',
            color5 = ' rgba( 0, 0, 0, 0.5)';      
        
        game.css.addRule('#menu',{
          'width': game.px(game.menu.width),
          'left': game.px(game.menu.left),
          'top': game.px(game.menu.top)
        });

        game.css.addRule('.button[DISABLED], .alertify-button[DISABLED]', {
            'color': '#ccc',
            'cursor': 'default'
        });
        game.css.addRule('.button',{
          'float': 'left'
        });
        game.css.addRule('.alertify', {
          'font': game.px(28)+'/'+game.px(36)+' "segment", sans-serif'
        });
        game.css.addRule('.button, .alertify-button', {
            'outline': '0',
            'font': game.px(28) + '/' + game.px(30) + ' pixel',
            'margin':  game.px(5),
            'color': 'white',
            'text-shadow': ' 0px ' + game.px(-3) + color1 + ',' +
                           ' 0px ' + game.px( 3) + color2 ,
            'background-color': color2,
            'box-shadow':  '0px ' + game.px(2)   + ' ' + game.px(6)  + color5 + ',' +
                           '0px ' + game.px(-35) + ' ' + game.px(35) + color3 + ' inset,'+ 
                           '0px ' + game.px(2)   + ' ' + game.px(6)  + ' white inset',
            'border': game.px(4) + ' solid ' + color1 ,
            'border-radius': game.px(12),
            'padding': game.px(16) + ' ' + game.px(16),
            'cursor': 'pointer'
          });

          game.css.addRule('.button:hover:not([DISABLED]), .alertify-button:hover:not([DISABLED])', {
            'background-color': color4,
            'box-shadow': '0px ' + game.px(4)   +  ' ' + game.px(6)  + color5 + ',' +
                          '0px ' + game.px(-30) +  ' ' + game.px(35) + color3 + ' inset,' +
                          '0px ' + game.px(2)   +  ' ' + game.px(6)  + ' white inset',
          });

          game.css.addRule('.button:active:not([DISABLED]), .alertify-button:active:not([DISABLED])', {
            'color': '#ddd',
            'background-color': color4,
            'box-shadow': '0px ' + game.px(-2) + ' ' + game.px(6)  + color5 + ',' +
                          '0px ' + game.px(30) + ' ' + game.px(35) + color3 + ' inset,' +
                          '0px         0px '         + game.px(2)  + ' white inset',
            'text-shadow': ' 0px ' + game.px(-3) + color2 + ',' +
                           ' 0px ' + game.px( 3) + color1 
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
        game.events.noDefault(e); 
        game.currentScore = 0;
        game.currentLifes = 2;
        game.currentLevel = 0;
        game.loadLevel(game.currentLevel);
      },   
      loadGame: function(e){
        game.events.noDefault(e); 
        var level = game.ask('Select Level:', '1');
        level = parseInt(level);
        if(!isNaN(level) && level > 0 && level < game.level.length){
          game.currentLevel = level;
          game.currentScore = 0;
          game.currentLifes = 2;
          game.loadLevel(level);
        }
      },
      highScore: function(){
        game.score.showHighScore();
      },
      github: function(){
        window.location = game.properties.source || 'https://github.com';
      },
      credits: function(){
        var c = 'rafælcastrocouto';
        if(game.properties.credits) c = game.properties.credits.join('<br>');
        alertify.alert(c);
      }
    },

    ///////////////////////////////LEVEL///////////////////////////////

    loadLevel: function(level){
      game.menu.el.style['display'] = 'none';
      game.css.paint('#478', game.container);
      game.ui.init();   
      game.stage.init();
      game.block.array = [];
      game.block.build(level);
      game.ball.array = [];
      game.ball.build(level); 
      game.pad.init(level);      
      game.power.array = [];
      game.changeMode('ready'); 
    },
    nextLevel: function(){
      game.menu.loadGame.el.disabled = false;
      game.menu.loadGame.el.on('click', game.menu.loadGame)
      ++game.currentLevel;
      if(game.currentLevel == game.level.length) game.win();
      else game.loadLevel(game.currentLevel);
    }, 

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
          'text-shadow': '0 0 '+ game.px(7) +' #fff',
          'font-size': game.px(30),
          'padding': game.px(6)
        });
      }
    }, 

    ///////////////////////////////SCORE///////////////////////////////

    score: {
      init: function(){
        game.score.scoreboard = [];
        try { game.score.scoreboard = JSON.parse(localStorage.getItem('scoreboard')) }
        catch(e) { /*console.log('No score detected.'+e)*/ }
        if(game.score.scoreboard && game.score.scoreboard.length){
          game.score.enable();
        } else game.score.scoreboard = [];
      },
      save: function(){
        try { localStorage.setItem('scoreboard', JSON.stringify(game.score.scoreboard)) }
        catch(e) { /*console.log('Not able to save score.'+e)*/ }
      },
      set: function(name, score){
        game.score.scoreboard.push({name: name, score: score});
        try { localStorage.setItem('scoreboard', JSON.stringify(game.score.scoreboard)) }
        catch(e) { /*console.log('Not able to save score.'+e)*/ }
        game.score.enable();
      },
      enable: function(){
        game.menu.highScore.el.disabled = false;
        game.menu.highScore.el.on('click', game.menu.highScore);
      },
      showHighScore: function(){
        var str = 'RANK *PLAYER* SCORE<BR>', 
            sb = game.score.scoreboard;
        sb.sort(function(a, b){return b.score - a.score});
        for (var i = 0; i < sb.length; i++) {
          str += (i + 1 ) + ' *'+sb[i].name + '* ' + sb[i].score + '<br>';
        };
        alertify.alert(str);
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

    ///////////////////////////////BLOCKS///////////////////////////////

    block: {
      init: function(id, className){
        var block = {
          el: game.create('div', {
            id: 'block' + id,
            className: 'block ' + className
          }),
          i: id,
          hitCount: 0,
          audio: {
            hit: 'hit',
            destroy: 'destroy'
          }                
        };
        if(!game.properties.blocks){
          game.properties.blocks = {
            'brick': {
              life: 2,
              color: ['#b22','#2b2']
            }
          };
        }
        for(var type in game.properties.blocks){
          var b = game.properties.blocks[type];
          if(type == className) {
            for(var prop in b){
              block[prop] = b[prop];
            }
          }
        }
        if(className == 'none') block = 0;
        else{
          game.block.css(block);
          game.css.paint(block.color[0], block);
          game.stage.add(block.el);
        }
        return block;   
      }, 
      build: function(level){
        var blocks = game.level[game.currentLevel];
        game.block.array = [];
        game.block.count = 0;
        for (var i = 0; i < blocks.length; i++) {
          var b = game.block.init(i, blocks[i]);
          if(b) {
            game.block.array.push(b);
            if(b.life > 0) ++game.block.count;
          }
        };
      },    
      css: function(block){ 
        var p = 9;
        var x = (block.i % p);
        var y = Math.floor(block.i/p);

        game.block.width = 95;
        game.block.height = 45;    

        block.x = (x * (game.block.width + p)) + p;
        block.y = (game.stage.height - game.block.height) - ((y * (game.block.height + p)) + p);
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
        --game.block.count;
        game.stage.el.removeChild(block.el);
        game.block.array.splice(block.i, 1);
      },
      checkCollision: function(ball){
        for (var i = 0; i < game.block.array.length; i++) { 
          var block = game.block.array[i];     
          if(game.collision(ball, block)){
            if(block.life > 0) ++block.hitCount;
            if(block.hitCount == block.life && block.life > 0) { //destroy block
              if(game.audio.enabled) game.audio[block.audio.destroy].play();
              game.currentScore += 10;
              game.ui.update();
              game.power.launch(block);
              block.i = i;
              game.block.end(block);
            } else { //change block color
              if(game.audio.enabled) game.audio[block.audio.hit].play();
              if(block.life > 0){
                game.css.paint(block.color[block.hitCount], block);
                game.currentScore += 1;
                game.ui.update();
              }
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
        if(game.block.count == 0) game.nextLevel();        
      }
    },

    ///////////////////////////////BALLS///////////////////////////////

    ball: {
      radius: 12,
      speed: 6,
      acceleration: 1.01,
      array: [],
      init: function(id, radius){
        if(!id) id = 0;
        if(!radius) radius = game.ball.radius;
        var ball = {
          el : game.create('div', {
            id: 'ball' + id,
            className: 'ball'
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
        game.ball.array.push(ball);  
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
          game.changeMode('playing'); 
          game.ball.array[0].speed.x = game.pad.speed / 10;
          game.ball.array[0].speed.y = game.ball.speed;
        }
      },   
      setRadius: function(r, ball){
        if(!ball) ball = game.ball.array[0];
        if(!r) r = game.ball.radius;
        ball.radius = r; 
        if(r < 5) r= 5;
        if(r > 80) r = 80;
        game.css.addRule('#'+ball.el.id, {
          'border-radius': game.px(r),
          'width': game.px(2 * r),
          'height': game.px(2 * r)
        })      
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
            game.power.clear();
          }
          //keep moving
          else {
              game.ball.moveTo({
              x: ball.x + ball.speed.x,
              y: ball.y + ball.speed.y
            }, ball); 
          }
        }
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
        game.changeMode('ready');
      },
      css: function(ball){ 
        ball.el.style['bottom'] = game.px(ball.y);
        ball.el.style['left'] = game.px(ball.x);
        var r = ball.radius;
        game.css.addRule('#'+ball.el.id, {
          'border-radius': game.px(r),
          'width': game.px(2 * r),
          'height': game.px(2 * r)
        })             
      }
    },

    ///////////////////////////////PAD///////////////////////////////

    pad: {
      init: function(level){
        if(!game.pad.el) game.pad.el = game.create('div', {
          id: 'pad'
        });
        game.stage.add(game.pad.el);
        game.pad.speed = 0;
        game.pad.key = 0;
        switch(level) {
          case 0:
            game.pad.setWidth(140);
          break; 
          case 1:
            game.pad.setWidth(120);
          break;          
          case 2:
            game.pad.setWidth(100);
          break;
        }
        game.css.paint('#789', game.pad); 
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
      touchMove: function(tx){
        game.pad.x = game.pad.inLimit(x);
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
        if(w < 50) w = 50;
        if(w > 400) w = 400;
        game.pad.width = w;
        game.pad.el.style['width'] = game.px(w);        
      },
      checkCollision: function(ball){
        if(game.collision(ball, game.pad)){ 
          if(game.audio.enabled) game.audio.pad.play();
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
          'border-radius':  '50% 50% 0 0',
          'height': game.px(game.pad.height),
          'bottom': game.px(game.pad.y)
        }); 
      }
    },    

  ///////////////////////////////POWERS///////////////////////////////    

    power: {
      radius: 20,
      speed: 3,
      types: ['increase', 'decrease', 'fast', 'slow'],
      array: [],
      init: function(id, radius){
        if(!id) id = 0;
        if(!radius) radius = game.power.radius;
        var power = {
          el : game.create('div', {
            id: 'power' + id,
            className: 'power shadow'
          }),
          radius: radius,
          speed: {x: 0, y: (-1 * game.power.speed)},
          i: id
        };
        game.stage.add(power.el); 
        return power;     
      },
      build: function(type){
        var power = game.power.init(game.power.array.length);
        game.power.array.push(power)
        power.type = type; 
        switch(type) {
          case 'increase':
            game.css.paint('#28d', power);
            power.el.textContent = '<>';
          break;  
          case 'decrease':
            game.css.paint('#d82', power);
            power.el.textContent = '><';
          break;
          case 'fast':
            game.css.paint('#d82', power);
            power.el.textContent = '+';
          break;     
          case 'slow':
            game.css.paint('#28d', power);
            power.el.textContent = '-';
          break;     
        };
        game.power.css(power);
        return power;
      },
      end: function(power){
        game.stage.el.removeChild(power.el);
        game.power.array.splice(power.i, 1);
      }, 
      clear: function(){
        while(game.power.array.length){
          var power = game.power.array[0];
          power.i = 0;
          game.power.end(power);
        }
      },  
      launch: function(block){
        if(!game.properties.drop) game.properties.drop = 0.5;
        if(Math.random() < game.properties.drop) { 
          var t = ~~(Math.random() * game.power.types.length);
          var power = game.power.build(game.power.types[t]); 
          o = {
            x: block.x + (block.width / 2) - (power.radius / 2),
            y: block.y + (block.height / 2) - (power.radius / 2)
          }; 
          game.power.moveTo(o, power);
        }
      },   
      moveTo: function(o, power){
        if(!power) power = game.power.array[0];
        power.x = o.x;
        power.el.style['left'] = game.px(o.x);
        if(o.y){
          power.y = o.y;
          power.el.style['bottom'] = game.px(o.y);
        } 
      },
      move: function(){
        for (var b = 0; b < game.power.array.length; b++) {
          var power = game.power.array[b];
          power.i = b;
          //predict next position
          power.nx = power.x + power.speed.x;
          power.ny = power.y + power.speed.y;
          //hit pad
          game.power.checkCollision(power);        
          //hit bottom
          if (power.y < 0) {
            game.power.end(power);
          }
          //keep moving
          else {
              game.power.moveTo({
              x: power.x + power.speed.x,
              y: power.y + power.speed.y
            }, power); 
          }
        }
        if(game.mode == 'playing') game.loop(game.power.move);
      },
      checkCollision: function(power){
        if(game.collision(power, game.pad)){ 
          game.power.end(power);
          if(game.audio.enabled) game.audio.power.play();
          switch(power.type) {
            case 'increase':
              game.pad.setWidth(game.pad.width + 25);
            break;
            case 'decrease':
              game.pad.setWidth(game.pad.width - 25);
            break;
            case 'fast':
              for(b in game.ball.array){
                var ball = game.ball.array[b];
                ball.speed.x *= 1.25;
                ball.speed.y *= 1.25;
                game.ball.array[b] = ball;
              }
            break;
            case 'slow':
              for(b in game.ball.array){
                var ball = game.ball.array[b];
                if(ball.speed.x > 2) ball.speed.x *= 0.7;
                if(ball.speed.y > 2) ball.speed.y *= 0.7;
                game.ball.array[b] = ball;
              }
            break;
          };          
        }
      },
      css: function(power){ 
        power.el.style['bottom'] = game.px(power.y);
        power.el.style['left'] = game.px(power.x);
        var r = power.radius;
        game.css.addRule('#'+power.el.id, {
          'line-height': game.px(2 * r),
          'font-size': game.px(1.2 * r),
          'border-radius': game.px(r),
          'width': game.px(2 * r),
          'height': game.px(2 * r)
        })             
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
          on = function(evt, f){ this.attachEvent('on'+evt, f) }
        } else if(window.addEventListener) {
          on = function(evt, f){ this.addEventListener(evt, f) }
        } else on = function(evt, f){ this['on'+evt] = f };
        game.on = on;
        window.on = on;
        document.on = on;
        document.body.on = on;
        game.css.events();
        game.mouse.events();
        game.touch.events();
        game.keyboard.events();
      },
      loop: function(){ 
        var isReady = (game.mode == 'ready');
        var isPlaying = (isReady || game.mode == 'playing');
        game.events.delay = 0;
        while ((new Date).getTime() > game.date) { 
          if(isPlaying && game.pad.key) game.pad.keyboardMove(game.pad.key);
          game.date += game.rate;
          ++game.events.delay;
        } 
        if(game.events.delay && isPlaying) {
          game.pad.el.style['left'] = game.px(game.pad.x); 
        }
        if(isReady) game.ball.followPad(); 
        game.loop(game.events.loop)
      },
      noDefault: function(event){
        if(event.stopPropagation) event.stopPropagation();
        if(event.preventDefault) event.preventDefault();
        event.returnValue = false;  
        event.cancelBubble=true;  
      }
    },

    ///////////////////////////////MOUSE///////////////////////////////

    mouse: {
      events: function(){
        document.on('mousemove', game.mouse.move);
        document.on('click', game.mouse.click);
        document.onselectstart = function(){return false};
        document.oncontextmenu = function(){return false};
      },
      click: function(e){ 
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
        game.touches = [];
        window.on('touchstart', game.touch.move);
        window.on('touchmove', game.touch.move);
        window.on('touchleave', game.touch.move);
        window.on('touchend', game.touch.move);
      },
      move: function(e){
        game.touches = e.changedTouches;
        for (var i=0; i < game.touches.length; i++) {
          game.pad.mouseMove(game.touches[i].pageX / game.convert);
        }
      }
    },


    ///////////////////////////////KEYBOARD///////////////////////////////

    keyboard: {
      events: function(){
        window.document.on('keydown', game.keyboard.down);
        window.document.on('keyup', game.keyboard.up);
      },    
      down: function(e){
        var key = e.which || e.keyCode;
        switch (key) { 
          case 80: // P
            game.pause();
          break;
          case 32: // Space
            game.ball.launch(game.ball.first);
          break;
          case 37: // Left arrow
          case 65: // A
            game.pad.key = -1;
            game.pad.speed = -100; 
          break;
          case 39: // Right arrow
          case 68: // D
            game.pad.key = 1; 
            game.pad.speed = 100;
          break;
          default:
            //console.log(key)
          break;
        };
      },
      up: function(e){
        var key = e.which || e.keyCode;
        switch (key) {
          case 37: // Left arrow
          case 65: // A          
          case 39: // Right arrow
          case 68: // D            
            game.pad.key = 0;
            game.pad.speed = 0;
          break;          
        }
      }
    },  
    pause: function(){
      if(game.mode != 'paused'){ // PAUSE
        if(game.mode == 'ready' || game.mode == 'playing') {
          game.lastMode = game.mode;
          game.changeMode('paused');
          game.ui.el.textContent = '* PAUSED *'
          game.css.paint('#222');
        }
      } else { // UNPAUSE
        game.changeMode(game.lastMode);
        if(game.mode == 'ready' || game.mode == 'playing') {
          game.ui.update();
          game.css.paint('#bbb');
        }
      }
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
      init: function(){
        var a = game.create('audio');
        if(!a.canPlayType) game.audio.enabled = false;
        else {
          if(a.canPlayType('audio/wav;').replace(/no/, '')) {
            game.audio.enabled = true;
            game.audio.format = 'wav';
          }
          if(a.canPlayType('audio/mpeg;').replace(/no/, '')) {
            game.audio.enabled = true;
            game.audio.format = 'mp3';
          }
        }
        if(game.audio.enabled && game.audio.format){
          var l = game.properties.audio || [];
          for (var i = 0; i < l.length; i++) {
            var name = l[i];
            game.audio[name] = game.create('audio', {src: 'audio/'+ name +'.'+game.audio.format});
            game.add(game.audio[name]);          
          }
        }
      }
    },

    ///////////////////////////////END///////////////////////////////

    ask: function(str, default_str){
      alertify.prompt(str, 
        function(e, name){ 
          if(e && name) {
            game.end(name);
          } else {
            game.end();
          }
        }, default_str
      );      
    },
    win: function(){
      game.css.paint('288');
      game.ui.el.textContent = '* YOU WIN *';
      game.changeMode('menu');
      game.ask('You Win!<br>*Score* ' + game.currentScore + '<br>Enter your name', 'Anonymous');
    },
    over: function(){
      game.css.paint('#d22');
      game.ui.el.textContent = '* GAME OVER *';
      game.changeMode('menu');
      game.ask('Game Over!<br>*Score* ' + game.currentScore + '<br>Enter your name', 'Anonymous');
    },
    end: function(name){
      if(!name) name = 'Anonymous';
      game.score.set(name, game.currentScore);
      game.ui.el.style['display'] = 'none';
      game.stage.el.style['display'] = 'none';
      game.currentLevel = 0;   
      game.css.paint('#bbb');
      game.css.paint('#69a', game.container);
    }
  };
  this.game = game;
};
