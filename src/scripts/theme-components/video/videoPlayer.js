/* NOTE : 
  Will wrap as react component later, players know play/pause state, but forgot user pausing 
  would need to override the auto-start / stop based on visibility when interacted with..
*/

const videoPlayer = ( videoConfig ) => {
  const debug = false; //Set to true for extra logging!

  // VIDEO CONFIG : Default : Use placeholder video setup if pieces missing
  const defaultVideoConfig = {
    autoplay: true,
    id: '_9VUPq3SxOc',
    mute: true,
    state: 'init',
    type: 'youtube'
  }
  var video = videoConfig;
  var player = null; // Populates later

  // SAFETY : Ensure ID and Type are provided
  if ( !videoConfig.id || !videoConfig.type ) {
    const missingItem = !videoConfig.type ? 'Type' : 'ID';
    console.log( `::: Error : [ VideoPlayer - Config Error ] -- Video configuration is missing the video ${missingItem}.` );

    // FALLBACK : Use default config object
    video = defaultVideoConfig;
  }
  video.state = 'init'; // Initial state.
  if ( debug ) { console.log( `::: DEBUG : Config Object : ${JSON.stringify( video )}`); };


  // PLAYER : Vimeo : Method to init a Vimeo video
  const vimeoPlayer = ( video ) => {
    var Vimeo = require('@vimeo/player');
    var options = {
      badge: 0,
      byline: 0,
      id: video.id, // Vimeo Video ID
      loop: true,
      portrait: 0
    }

    // CREATE : Vimeo : Build player (Uses video's ID as the element ID)
    player = new Vimeo( `video-${video.id}`, options );
    if ( debug ) { console.log( '::: DEBUG : VIMEO : Player initialized' ); };


    // MUTE : If configured to auto-mute
    if ( video.mute ) {
      if ( debug ) { console.log( '::: DEBUG : VIMEO : Mute enabled, setting volume to 0' ); };
      player.setVolume(0);
    }

    // VISIBLE-AUTOPLAY : Setup autoplay when video in viewport if enabled
    if ( video.autoplay ) {
      visibleAutoplay( video );
    }


    // PLAY / PAUSE : Update state when video state changes to tell if user interaction occurred
    player.on( 'play', function(stats) {
       
        // USER PLAY : User has clicked play if not set to auto:play already
        if ( video.state === 'user:pause' ) {
          video.state = 'user:play';
        }
        if ( debug ) { console.log( `::: DEBUG : VIMEO : Set state to -- ${video.state}` ); };
    });
    player.on( 'pause', function(stats) {

        // USER PAUSE : Set state that user has paused this video
        if ( video.state !== 'auto:pause' ) {
          video.state = 'user:pause';
        }
        if ( debug ) { console.log( `::: DEBUG : VIMEO : Set state to -- ${video.state}` ); };
    });
  };


  // PLAYER : Youtube : Method to init a Youtube video
  const youtubePlayer = ( video ) => {
    var YoutubeLoader = require('youtube-iframe');


    // PLAY / PAUSE : Update state when video state changes to tell if user interaction occurred
    const onPlayerStateChange = ( yt_player ) => {
      const yt_state = yt_player.data;

      // YOUTUBE - PLAY (numbers b/c they don't wanna translate :p )
      if ( yt_state === 1 ) {

        // USER PLAY : User has clicked play if not set to auto:play already
        if ( video.state === 'user:pause' ) {
          video.state = 'user:play';
        }
        if ( debug ) { console.log( `::: DEBUG : YOUTUBE : Set state to -- ${video.state}` ); };
      }


      // YOUTUBE - PAUSE
      if ( yt_state === 2 ) {

        // USER PAUSE : Set state that user has paused this video
        if ( video.state !== 'auto:pause' ) {
          video.state = 'user:pause';
        }
        if ( debug ) { console.log( `::: DEBUG : YOUTUBE : Set state to -- ${video.state}` ); };
      }
    };


    // PLAYER READY : Youtube is derpy and needs help when its ready re-initalzing
    const onPlayerReady = () => {
      if ( debug ) { console.log( '::: DEBUG : YOUTUBE : Player -- READY!' ); };
      
      // VISIBLE-AUTOPLAY : Setup autoplay when video in viewport if enabled
      if ( video.autoplay ) {
        visibleAutoplay( video );
      }
    };


    // CREATE : Youtube : Build player (Uses video's ID as the element ID)
    YoutubeLoader.load(function(YT) {
      player = new YT.Player( `video-${video.id}`, {
        // width: '850',
        // height: '480',
        playerVars: {
          byline: 0,
          loop: 1,
          modestbranding: 0,
          origin: window.location.protocol + window.location.hostname,
          portrait: 0,
          rel: 0,
          showinfo: 0,
          vq: 720
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
        videoId: video.id // Youtube Video ID
      });

      // Loop video
      player.setLoop = 1;

      // MUTE : If configured to auto-mute
      if ( video.mute ) {
        if ( debug ) { console.log( '::: DEBUG : YOUTUBE : Mute enabled, setting volume to 0' ); };
        player.mute();
      }

    });
  };


  /* AUTO-PLAY CONTROL : Manages states to ensure clean UX usage with users
   *
   *   2 Types of state control:
   *      1. "auto:STATE"    (ex: 'auto:play' )
   *      2. "user:STATE"    (ex: 'user:pause' )
   *
   *      'user:pause' / 'user:play' is set via the video
   *      playback handlers as its only way to tell since
   *      they are in iframes. 
   *
   *  TL;DR: 
   *    User pause interaction causes the auto-play when element visible
   *    visible to disable until user clicks play again, then it will
   *    resume auto-play/pause when scrolled in/out of view.
   *
   * -------------------------------------------------------- */
  const autoPlayControl = ( passedId ) => {
    const { id, state, type } = video;

    // CHECK : Proper Video to act on?
    if ( player && passedId === id ) {

      // STATE CHECKS:
      const isPaused = /pause|init/gi.test( state );
      const userPaused = state === 'user:pause'; // 'user:pause' comes from video pause handlers

      // AUTO-CONTROL : Don't respond to visibility updates until user plays video again if they paused it.
      //                (assuming a user pausing video manually means they want it to stop completely)
      if ( !userPaused ) {

        // AUTO-PLAY : Only if NOT user paused
        if ( isPaused ) {
          type === 'vimeo' ? player.play() : player.playVideo();
          video.state = 'auto:play';
          if ( debug ) { console.log( '::: DEBUG : autoPlayControl -- VISIBLE - Hit Play' ); }


        // AUTO-PAUSE : Okay to fire pause on a paused element, makes for less verbosity
        } else {
          type === 'vimeo' ? player.pause() : player.pauseVideo(); //Firing pause on a paused video wont hurt it
          video.state = 'auto:pause'; 
          if ( debug ) { console.log( '::: DEBUG : autoPlayControl -- HIDDEN - Hit Pause' ); };
        }
      }
    }
  };


  // VISIBLE-AUTOPLAY : Play video when on screen, pause when off
  const visibleAutoplay = ( video ) => {
    if ( debug ) { console.log( '::: DEBUG : visibleAutoplay() -- Initializing Visibility Sensor' ); };
    var inView = require( 'in-view' );

    // VISIBILITY : Trigger play state changes when video enters / exits viewport.
    $(document).ready( () => {
      inView( `#video-${video.id}` )

        // ENTERED VIEWPORT
        .on( 'enter', el => {
          if ( debug ) { console.log( '::: DEBUG : visibleAutoplay() ---- VISIBLE' ); };
          autoPlayControl( video.id );
        })

        // EXITED VIEWPORT
        .on( 'exit', el => {
          if ( debug ) { console.log( '::: DEBUG : visibleAutoplay() ---- HIDDEN' ); };
          autoPlayControl( video.id );
        });
    });
  }



  // INITALIZER : Create the video based on our passed in data
  const init = () => {
    if ( debug ) { console.log( '::: DEBUG : videoPlayer : init() -- Creating video elements...' ); };

    // VIMEO : Create a Vimeo video element
    if ( video.type === 'vimeo' ) {
      vimeoPlayer( video );

    // YOUTUBE : Create a Yotuube video element
    } else if ( video.type === 'youtube' ) {
      youtubePlayer( video );

    // UNSUPPORTED : User passed a type of video that isn't supported by this player yet
    } else {
      console.log( `::: Error : [ VideoPlayer - init() ] -- Video type '${video.type}' is not currently supported.` );
    }
  }
  

  // START : Initialize our player!
  init();
};


// EXPORT : Pass out the player module
module.exports = videoPlayer;
