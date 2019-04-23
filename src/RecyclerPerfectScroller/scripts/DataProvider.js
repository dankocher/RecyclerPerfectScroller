const DataProvider = (data, layoutProvider) => {
    let dataProvider = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        dataProvider[i] = {
            index: i,
            data: data[i],
            layout: layoutProvider({
                index: i,
                item: data[i],
                top: i === 0 ? 0 : dataProvider[i-1].layout.top + dataProvider[i-1].layout.height})
        };
    }
    return dataProvider
};
export default DataProvider;