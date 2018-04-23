export const colors = {
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