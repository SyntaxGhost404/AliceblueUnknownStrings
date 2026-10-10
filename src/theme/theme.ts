// Global design tokens. Values mirror the reference build's theme module 1:1 so that
// every screen keeps the original palette, type scale and per-phone app colours.

const statusColors = { online: '#4CAF50CC', offline: '#FFFFFF22' };

const theme = {
  padding: '6%',
  fontFamily: 'Quicksand-Medium',
  colors: {
    white: '#FFF',
    black: '#000',
    black2: '#242424',
    black3: '#484848',
    darkerGray: '#666666',
    darkGray: '#999999',
    mediumGray: '#CCCCCC',
    lightGray: '#EEEEEE',
    red: '#F44336',
    green: '#4CAF50',
    blue: '#0086C3',
    yellow: '#ECC746',
    orange: '#FFA500',
    darkBlue: '#CCCCCC',
    tan: '#a8903b',
    overlay: '#222222DD',
    pink: '#e51fef',
    subtitle: '#00000088',
    hintButton: '#ECC746',
    accent: '#D9B665',
    creditOthers: '#EFD69B',
    blueChalk: '#C4E1FC',
  },
  fontSizes: {
    h1: 30,
    h2: 26,
    h3: 22,
    h4: 20,
    h5: 18,
    text: 16,
    subtext: 14,
    caption: 12,
    small: 10,
    tiny: 8,
  },
  suspectboard: {
    colors: {
      notificationBar: '#000',
      home: { background: '#000' },
    },
  },
  // Adam's phone.
  myphone: {
    accent: '#168aad',
    statusContent: '#ccc',
    notifications: {
      colors: {
        background: '#1C1C1CFF',
        backgroundActive: '#0086C3',
        time: '#FEFEFE',
        date: '#FEFEFE',
        objective: '#D0AC2D',
        callAccept: '#198B54',
        callDecline: '#94413A',
      },
    },
    lockscreen: {
      colors: {
        background: 'transparent',
        notificationBar: 'transparent',
        time: '#FEFEFE',
        date: '#FEFEFE',
        passlock: '#AAA',
      },
    },
    homescreen: {
      colors: {
        background: 'transparent',
        notificationBar: 'transparent',
        time: '#FEFEFE',
        date: '#FEFEFE',
        badge: '#F44336',
      },
    },
    messages: {
      colors: {
        notificationBar: '#011821',
        header: { background: '#011821', status: statusColors, items: '#FFFFFF', border: '#061923' },
        home: { background: 'transparent', name: 'black', message: '#999999', date: '#999999' },
        chat: {
          background: 'transparent',
          message1: '#FFFFFF11',
          message1text: '#DDF5FF',
          message2: '#FFFFFF29',
          message2text: '#EEF7FF',
          contactText: '#9FDFFF',
          sender: '#4E9FFF',
          option: '#FFFFFF00',
          optionText: '#FFFFFFEE',
          optionBorder: '#FFFFFF08',
          date: '#FFFFFF66',
          status: '#FFFFFF59',
        },
      },
    },
    calculator: {
      colors: {
        notificationBar: '#180202',
        header: { background: '#180202', border: '#222222DD', items: '#FFF' },
        background: '#281212',
        types: ['#1F0F0F', '#1F0F0F', '#180202'],
      },
    },
    settings: {
      colors: {
        notificationBar: '#020202',
        header: { background: '#020202', border: '#222222DD', items: '#FFF' },
        background: '#0C0C0C',
      },
    },
    call: {
      colors: {
        notificationBar: '#01100D',
        header: { background: '#01100D', status: statusColors, items: '#FFFFFF' },
        dial: { background: 'transparent' },
        background: '#031815',
        keypadBackground: '#333333',
        text: 'black',
        activeTab: '#41C2F9',
        inactiveTab: '#767577',
        border: '#767577',
        backdrop: '#222222DD',
      },
    },
    notes: {
      colors: {
        notificationBar: '#090909',
        header: { background: '#090909', items: '#BBB' },
        background: '#090909',
        accent: '#AF934A',
      },
    },
    archive: {
      colors: {
        notificationBar: '#020F14',
        header: { background: '#020F14', status: statusColors, items: '#FFFFFF', border: '#282206' },
        background: '#071920',
        accent: '#89B1C3',
        headerFill: '#41C2F9',
        noteBG: '#131313',
        noteText: '#DDF5FF',
        noteLive: '#ECC746',
      },
    },
    browser: {
      colors: {
        notificationBar: '#161616',
        header: { background: '#161616', items: '#FFFFFF' },
        background: '#242424',
        searchBG: '#242424',
        searchBorder: '#ffffff00',
        searchText: '#FFFFFF',
      },
    },
    sidetrails: {
      colors: {
        notificationBar: '#030303',
        header: { background: 'transparent', items: '#ccc' },
        background: '#242424',
        searchBG: '#242424',
        searchBorder: '#ffffff00',
        searchText: '#FFFFFF',
      },
    },
  },
  // Zoey's phone.
  herphone: {
    accent: '#e5383b',
    statusContent: '#ccc',
    notifications: {
      colors: {
        background: '#1C1C1CFF',
        backgroundActive: '#0086C3',
        time: '#FEFEFE',
        date: '#FEFEFE',
        objective: '#D0AC2D',
      },
    },
    lockscreen: {
      colors: {
        background: '#00000099',
        notificationBar: '#00000099',
        time: '#FEFEFE',
        date: '#FEFEFE',
        passlock: '#DDD',
      },
    },
    homescreen: {
      colors: {
        background: '#00000077',
        notificationBar: '#00000077',
        time: '#FEFEFE',
        date: '#FEFEFE',
        badge: '#F44336',
      },
    },
    messages: {
      colors: {
        notificationBar: '#011821',
        header: { background: '#011821', status: statusColors, items: '#FFFFFF', border: '#061923' },
        home: { background: 'transparent', name: 'black', message: '#999999', date: '#999999' },
        chat: {
          background: 'transparent',
          message1: '#FFFFFF11',
          message1text: '#DDF5FF',
          message2: '#FFFFFF29',
          message2text: '#EEF7FF',
          contactText: '#9FDFFF',
          sender: '#4E9FFF',
          option: '#FFFFFF00',
          optionText: '#FFFFFFEE',
          optionBorder: '#FFFFFF08',
          date: '#FFFFFF66',
          status: '#FFFFFF59',
        },
      },
    },
    mail: {
      colors: {
        background: '#1D0F0F',
        notificationBar: '#150303',
        text: '#202225',
        iconText: 'white',
        inbox: '#767577',
        attachmentInfo: '#555555DD',
        accent: '#FF5858AA',
        header: { background: '#150303', border: '#222222DD', items: '#FFFFFF' },
      },
    },
    gallery: {
      colors: {
        notificationBar: '#07080D',
        header: { background: '#090909', items: '#FFFFFF' },
        background: 'transparent',
        dateTime: { text: '#FEFEFE' },
        icon: { onBackground: '#2D314E', offbackground: '#FFFFFF04' },
        popover: { background: '#383737' },
      },
    },
    settings: {
      colors: {
        notificationBar: '#020202',
        header: { background: '#020202', border: '#222222DD', items: '#FFF' },
        background: '#0C0C0C',
      },
    },
    call: {
      colors: {
        notificationBar: '#031512',
        header: { background: '#031512', status: statusColors, items: '#FFFFFF' },
        dial: { background: 'transparent' },
        background: '#0F1D1A',
        keypadBackground: '#333333',
        text: 'black',
        activeTab: '#41C2F9',
        inactiveTab: '#767577',
        border: '#767577',
        backdrop: '#222222DD',
      },
    },
    pixabowl: {
      colors: {
        notificationBar: '#1a011d',
        header: { background: '#11030D', status: statusColors, items: '#FFFFFF' },
        background: 'transparent',
        bar: '#ffffff11',
        text: '#fefefe',
        headerBg: '#f7f4f4',
        badgeBackground: '#1bdcf9',
        submitButton: '#fefefe',
        border: '#222222DD',
        icon: '#F44336',
        divider: '#FFFFFF33',
      },
    },
    diary: {
      colors: {
        background: '#D9D9D9',
        notificationBar: '#211503',
        header: { background: '#211503', items: '#FFFFFF' },
      },
    },
    files: {
      colors: {
        background: '#070E13',
        notificationBar: '#05090D',
        text: '#202225',
        iconText: 'white',
        inbox: '#767577',
        attachmentInfo: '#555555DD',
        accent: '#FF5858AA',
        header: { background: '#05090D', border: '#222222DD', items: '#FFFFFF' },
      },
    },
    symmetry: {
      colors: {
        notificationBar: '#070707',
        header: { background: 'transparent', items: '#ddd' },
        background: '#121212',
        lives: '#E55B5B',
        diamonds: '#85B8E7',
        chevron: '#CCC',
      },
    },
    recovery: {
      colors: { background: '#000404', notificationBar: '#000404' },
    },
    safemode: {
      colors: { background: 'transparent', notificationBar: 'transparent' },
    },
  },
} as const;

export type PhoneName = 'myphone' | 'herphone';
export type FontSizeVariant = keyof typeof theme.fontSizes;

/** Loosely-typed accessor for per-phone app colours (apps differ between phones). */
export function phoneTheme(phone: PhoneName): any {
  return theme[phone];
}

export default theme;
