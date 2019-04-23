import React, {Component} from 'react';
import PropTypes from "prop-types";
import '../styles/styles.css';

const FACTOR = 1.2;

class RecyclerPerfectScroller extends Component {
    static propTypes = {
        dataProvider: PropTypes.array.isRequired,
        rowRender: PropTypes.func.isRequired,
    };

    state = {
        items: [],
        width: '100%',
        height: 0,
        max: 0,
        scrollTop: 0,
        scrollHeight: 0,
        dragging: false
    };

    async showLayouts(props) {
        let height = 0;
        let max = 0;
        for (const data of props.dataProvider) {
            const layout = data.layout;
            height += layout.height;
            if (max < layout.height) max = layout.height;
        }

        this.oneScreenItems = parseInt((this.__container.offsetHeight / max).toString()) * FACTOR;
        if (this.oneScreenItems < 5) this.oneScreenItems = 5;

        const items = props.dataProvider.slice(0, this.oneScreenItems);

        await this.setState({ height, max, items });

        let dif = this.__container.offsetWidth - this.__content.offsetWidth;
        let scrollHeight = this.__container.offsetHeight * this.__container.offsetHeight / height;
        let width = `calc(100% + ${dif}px)`;
        await this.setState({ width, scrollHeight });
        this.startScroll();
    }

    componentDidMount() {
        if (this.props.dataProvider.length > 0) {
            this.showLayouts(this.props);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.showLayouts(nextProps);
    }

    handleScroll = e => {
        let scroll = this.__container;
        let scroll_top = parseInt(scroll.scrollTop.toString());
        let first = parseInt((scroll_top / this.state.max).toString());//TODO: get for dynamical height

        let items = this.props.dataProvider.slice(first, first + this.oneScreenItems);

        let scrollTop = scroll_top * this.__container.offsetHeight / this.state.height;

        this.setState({ items, scrollTop });
    };

    render() {
        const {rowRender} = this.props;

        const {width, height, items, scrollTop, scrollHeight} = this.state;

        return (
            <div className={'recycler-scroll-width'} style={{width: '100%', height: '100%'}}>
            <div className="recycler-perfect-scroller"
                 ref={container => this.__container = container}
                 onScroll={this.handleScroll}
                 style={{width: width, height: '100%'}}>
                    <div className="scroller-content" style={{width: '100%', height}}
                        ref={content => this.__content = content}
                    >
                        {items.map((item, index) => (
                            <div key={`item-${item.index}`} className={'recycler-layout'} style={item.layout} >
                                {rowRender({item: item.data, index: item.index})}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="recycler-scroll-bar">
                    <div className="scroll-bar-thumb"
                         ref="container"
                         onMouseUp={this.mouseUpHandle}
                         onMouseMove={this.mouseMoveHandle}
                         onMouseDown={this.mouseDownHandle}
                         style={{left: 0, top: scrollTop, height: scrollHeight}}
                    />
                </div>
            </div>
        )
    }

    startScroll() {
        window.addEventListener('mouseup', this.mouseUpHandle);
        window.addEventListener('mousemove', this.mouseMoveHandle);
    }

    componentWillUnmount() {
        window.container.removeEventListener('mouseup', this.mouseUpHandle);
        window.container.removeEventListener('mousemove', this.mouseMoveHandle);
    }

    mouseUpHandle = (e) => {
        if (this.state.dragging) {
            this.setState({dragging: false});
        }
    }

    mouseDownHandle = (e) => {
        if (!this.state.dragging) {
            this.setState({dragging: true});
            this.lastClientY = e.clientY;
            e.preventDefault();
        }
    }

    mouseMoveHandle = (e) => {
        if (this.state.dragging) {
            // let scrollTop = scroll_top * this.__container.offsetHeight / this.state.height;

            this.__container.scrollTop += (-this.lastClientY + (this.lastClientY = e.clientY)) * this.state.height / this.__container.offsetHeight;
        }
    }

}

export default RecyclerPerfectScroller;