export const colors = {
	gray: {
		50: '#fafafa',
		100: '#f5f5f5',
		200: '#eeeeee',
		300: '#e0e0e0',
		400: '#bdbdbd',
		500: '#9e9e9e',
		600: '#757575',
		700: '#616161',
		800: '#424242',
		900: '#212121'
	},
	purple: {
		50: '#F3E5F5',
		100: '#E1BEE7',
		200: '#CE93D8',
		300: '#BA68C8',
		400: '#AB47BC',
		500: '#9C27B0',
		600: '#8E24AA',
		700: '#7B1FA2',
		800: '#6A1B9A',
		900: '#4A148C',
		A100: '#EA80FC',
		A200: '#E040FB',
		A400: '#D500F9',
		A700: '#AA00FF'
	},
	blue: {
		50: '#E3F2FD',
		100: '#BBDEFB',
		200: '#90CAF9',
		300: '#64B5F6',
		400: '#42A5F5',
		500: '#2196F3',
		600: '#1E88E5',
		700: '#1976D2',
		800: '#1565C0',
		900: '#0D47A1',
		A100: '#82B1FF',
		A200: '#448AFF',
		A400: '#2979FF',
		A700: '#2962FF'
	},
	red: {
		50: '#FFEBEE',
		100: '#FFCDD2',
		200: '#EF9A9A',
		300: '#E57373',
		400: '#EF5350',
		500: '#F44336',
		600: '#E53935',
		700: '#D32F2F',
		800: '#C62828',
		900: '#B71C1C',
		A100: '#FF8A80',
		A200: '#FF5252',
		A400: '#FF1744',
		A700: '#D50000'
	},
	pink: {
		50: '#FCE4EC',
		100: '#F8BBD0',
		200: '#F48FB1',
		300: '#F06292',
		400: '#EC407A',
		500: '#E91E63',
		600: '#D81B60',
		700: '#C2185B',
		800: '#AD1457',
		900: '#880E4F',
		A100: '#FF80AB',
		A200: '#FF4081',
		A400: '#F50057',
		A700: '#C51162'
	},
	orange: {
		50: '#FFF3E0',
		100: '#FFE0B2',
		200: '#FFCC80',
		300: '#FFB74D',
		400: '#FFA726',
		500: '#FF9800',
		600: '#FB8C00',
		700: '#F57C00',
		800: '#EF6C00',
		900: '#E65100',
		A100: '#FFD180',
		A200: '#FFAB40',
		A400: '#FF9100',
		A700: '#FF6D00'
	},
	deep_orange: {
		50: '#FBE9E7',
		100: '#FFCCBC',
		200: '#FFAB91',
		300: '#FF8A65',
		400: '#FF7043',
		500: '#FF5722',
		600: '#F4511E',
		700: '#E64A19',
		800: '#D84315',
		900: '#BF360C',
		A100: '#FF9E80',
		A200: '#FF6E40',
		A400: '#FF3D00',
		A700: '#DD2C00'
	},
	yellow: {
		50: '#FFFDE7',
		100: '#FFF9C4',
		200: '#FFF59D',
		300: '#FFF176',
		400: '#FFEE58',
		500: '#FFEB3B',
		600: '#FDD835',
		700: '#FBC02D',
		800: '#F9A825',
		900: '#F57F17',
		A100: '#FFFF8D',
		A200: '#FFFF00',
		A400: '#FFEA00',
		A700: '#FFD600'
	},
	green: {
		50: '#E8F5E9',
		100: '#C8E6C9',
		200: '#A5D6A7',
		300: '#81C784',
		400: '#66BB6A',
		500: '#4CAF50',
		600: '#43A047',
		700: '#388E3C',
		800: '#2E7D32',
		900: '#1B5E20',
		A100: '#B9F6CA',
		A200: '#69F0AE',
		A400: '#00E676',
		A700: '#00C853'
	},
	gray050: '#fafafa',
	gray100: '#f5f5f5',
	gray200: '#eeeeee',
	gray300: '#e0e0e0',
	gray400: '#bdbdbd',
	gray500: '#9e9e9e',
	gray600: '#757575',
	gray700: '#616161',
	gray800: '#424242',
	gray900: '#212121',
	blueA100: '#82b1ff',
	blueA200: '#448aff',
	blueA400: '#2979ff',
	red500: '#f44336',
	red700: '#d32f2f',
	red900: '#b71c1c',
	orangeA200: '#ffab40',
	orangeA700: '#ff6d00',
	green400: '#66bb6a',
	green500: '#4caf50',
	greenA400: '#00e676',
	white: '#ffffff',
	black: '#000000',
	alpha: 'rgba(0,0,0,0)'
};

// material design page regex: (A?[0-9]{2,3})\n\s*(#[0-9A-F]{6})

export function hexColorToDecimal(string) {
	let list = [];
	let str = string.slice(1);
	let t = '';

	for(let i = 0,l = str.length; i < l; ++i) {
		t += str[i];

		if(i % 2) {
			list.push(parseInt(t,16));
			t = '';
		}
	}

	while(list.length !== 3) {
		list.push(0);
	}

	return list.join(',');
}