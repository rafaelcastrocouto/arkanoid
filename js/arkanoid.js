var arkanoid = new Game();

arkanoid.game.properties = {
  fps:     50,
  width: 1000,
  height: 750,
  drop:  0.25,
  audio: [ 'hit', 'destroy', 'power', 'pad' ],
  blocks: {
    'metal': {
      life: 0, //unbreakable
      color: ['#bbb']
    },
    'stone': {
      life: 5,
      color: ['#222','#444','#666','#b22','#2b2']
    },
    'brick': {
      life: 2,
      color: ['#b22','#2b2']
    },
    'plast': {
      life: 1,
      color: ['#2b2']
    }
  },
  levels: [ 
  /*0*/['metal','plast','stone','brick','metal','brick','stone','plast','metal',
        'none' ,'plast','plast','none' ,'plast','none' ,'plast','plast','none' ,
        'plast','plast','stone','brick','plast','brick','stone','plast','plast'],

  /*1*/['stone','stone','stone','plast','stone','plast','stone','stone','stone',
        'brick','plast','plast','brick','plast','brick','plast','plast','brick',
        'stone','stone','stone','plast','stone','plast','stone','stone','stone'],

  /*2*/['brick','stone','brick','stone','plast','stone','brick','stone','brick',
        'stone','none' ,'stone','brick','stone','brick','stone','none' ,'stone',
        'brick','stone','metal','stone','plast','stone','metal','stone','brick',]             
  ],
  github: 'https://github.com/rafaelcastrocouto/arkanoid',
  credits: [
    'Author:  rafaelcastrocouto',
    'Sounds:  soundjax.com',
    'Fonts:  fontsquirrel.com',
    'Host:  github.com'
  ]
}

arkanoid.game.init();
