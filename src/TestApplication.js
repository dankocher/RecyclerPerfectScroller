import React, {Component} from 'react';

import {RecyclerPerfectScroller, DataProvider} from './RecyclerPerfectScroller';

class TestApplication extends Component {

    state = {
        data: [],
        dataProvider: []
    };

    componentWillMount() {
        this.start();
    }
    async start () {
        let data = new Array(100);
        for (let i = 0; i < data.length; i++) {
            data[i] = {number: i, name: `name ${i}`};
        }
        await this.setState({data});
        let dataProvider = new DataProvider(this.state.data, this.layoutProvider);
        this.setState({dataProvider});
    }

    rowRender({item, index}) {
        return <div style={{width: '100%', height: '100%', borderBottom: "1px solid gray"}}>{item.name}</div>
    }

    layoutProvider({item, index, top}) {
        return {width: '100%', height: 291, top: top}
    }

    render() {
        return (
            <div className="test-application" style={styles.container}>
                <RecyclerPerfectScroller
                    dataProvider={this.state.dataProvider}
                    rowRender={this.rowRender}
                />
            </div>
        )
    }
}

export default TestApplication;

let styles = {
    container: {
        width: '100%',
        height: '100%'
        // width: 121,
        // height: 250
    }
}