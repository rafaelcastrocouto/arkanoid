var arkanoid = new Game();

arkanoid.game.properties = {
  fps:     50,
  width: 1000,
  height: 750,
  drop:  0.25,
  intro: {
    title: 'ARKANOID',
    duration: 5
  },
  audio: [ 'hit', 'destroy', 'power', 'pad' ],
  fonts: ['segment', 'pixel', 'entypo'],
  blocks: {
    'metal': {
      life: 0, //unbreakable
      color: ['#257b9b']
    },
    'stone': {
      life: 5,
      color: ['#134e9b','#663bb5','#c02f9b','#ef5c77','#28b9b5']
    },
    'brick': {
      life: 2,
      color: ['#ff4e78','#ff9d38']
    },
    'plast': {
      life: 1,
      color: ['#61e85b']
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
  source: 'https://github.com/rafaelcastrocouto/arkanoid',
  credits: [
    '*Author*  <a target="" href="http://scriptogr.am/rafaelcastrocouto">rafaelcastrocouto</a>',
    '*Sounds*  <a target="" href="http://soundjax.com">soundjax.com</a>',
    '*Fonts*  <a target="" href="http://fontsquirrel.com">fontsquirrel.com</a>',
    '*Host*  <a target="" href="http://github.com">github.com</a>',
    '*Breakout*  <a target="" href="http://www.atari.com/">Atari</a>',
    '*Alertfy*  <a target="" href="https://twitter.com/fabien_doiron">Fabien Doiron</a>'
  ]
}

arkanoid.game.init();
