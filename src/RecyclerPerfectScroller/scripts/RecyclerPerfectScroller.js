import React, {Component} from 'react';
import PropTypes from "prop-types";
import '../styles/styles.css';

const FACTOR = 2;
const MIN = 10;
const reducer = (accumulator, currentValue) => accumulator + currentValue;
class RecyclerPerfectScroller extends Component {
    static propTypes = {
        dataProvider: PropTypes.array.isRequired,
        rowRender: PropTypes.func.isRequired,
        onScrollEnd: PropTypes.func.isRequired,
        footerRender: PropTypes.func,
    };

    state = {
        items: [],
        width: '100%',
        height: 0,
        max: 0,
        scrollTop: 0,
        scrollHeight: 0,
        firstShowWork: 0,
        dragging: false,
        scrollStarted: false
    };

    async showLayouts(props) {

        const footerHeight = this.__footer === undefined ?  0 : this.__footer.clientHeight;

        let height = props.dataProvider.map(d => d.layout.height).reduce(reducer) + footerHeight;

        const __max = this.state.max === 0 ? props.dataProvider[this.state.firstShowWork].layout.height : this.state.max;

        this.oneScreenItems = parseInt((this.__container.offsetHeight / __max).toString()) * FACTOR;

        const items = props.dataProvider.slice(this.state.firstShowWork, this.state.firstShowWork + this.oneScreenItems);
        let heightCount = items.map(d => d.layout.height).reduce(reducer);
        const max = heightCount / items.length;
        await this.setState({ height, max, items });

        let dif = this.__container.offsetWidth - this.__content.offsetWidth;
        let scrollHeight = this.__container.offsetHeight * this.__container.offsetHeight / height;
        let width = `calc(100% + ${dif}px)`;
        await this.setState({ width, scrollHeight });
        // console.log(this.__content.offsetHeight, this.__content.offsetTop, this.__container.offsetHeight, this.__container.scrollTop);
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
        let firstShowWork = (this.props.dataProvider.findIndex(d => d.layout.top >= scroll_top)) - 1;
        if (firstShowWork < 0) firstShowWork = 0;

        let items = this.props.dataProvider.slice(firstShowWork, firstShowWork + this.oneScreenItems);

        let scrollTop = scroll_top * this.__container.offsetHeight / this.state.height;

        this.setState({ items, scrollTop, firstShowWork });

        let heightCount = items.map(d => d.layout.height).reduce(reducer);
        const max = heightCount / items.length;
        this.setState({ max });

        if (this.__content.offsetHeight === this.__container.offsetHeight + scroll_top) {
            this.props.onScrollEnd();
        }

        // console.log(this.__content.offsetHeight, this.__content.offsetTop, this.__container.offsetHeight, scroll_top, this.__container.offsetHeight + scroll_top, )
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
                        {
                            this.props.footerRender === undefined ? null :
                                <div className={'recycler-footer'}
                                     ref={footer => this.__footer = footer}
                                >
                                    {this.props.footerRender()}
                                </div>
                        }
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
        if (!this.state.scrollStarted) {
            window.addEventListener('mouseup', this.mouseUpHandle);
            window.addEventListener('mousemove', this.mouseMoveHandle);
            this.setState({scrollStarted: true})
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.mouseUpHandle);
        window.removeEventListener('mousemove', this.mouseMoveHandle);
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