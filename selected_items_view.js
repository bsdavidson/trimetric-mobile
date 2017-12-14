import React, {Component} from "react";
import {connect} from "react-redux";
import Moment from "moment";

import {getSelectedItem, ROUTE_TYPE_ICONS} from "./selectors";

import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";

import {selectItemIndex, setMapViewInset} from "./actions";
import Arrivals from "./arrivals";
import tram from "./assets/tram.png";
import bus from "./assets/bus.png";
import stopImage from "./assets/stop.png";

const VEHICLE_IMAGE = {
  0: tram,
  3: bus
};

const MAP_AREA_OFFSET = 250;
const HEADER_HEIGHT = 100;
const HEADER_PAGINATION_HEIGHT = 20;
const STATUS_BAR_OFFSET = Platform.OS === "android" ? 24 : 0;

function headerPagination(contentLength, index) {
  let pageNav = [];
  for (let i = 0; i < contentLength; i++) {
    let style = index === i ? styles.active : styles.inactive;
    pageNav.push(
      <View key={"pgnav-" + i} style={style}>
        <Text>{i + 1}</Text>
      </View>
    );
  }
  return pageNav;
}

function keyExtractor(item, index) {
  return String(index);
}

class SelectedItemsView extends Component {
  constructor(props) {
    super(props);
    let screenWidth = Dimensions.get("window").width;
    let screenHeight = Dimensions.get("window").height + STATUS_BAR_OFFSET;

    this.state = {
      currentIndex: 0,
      isOpen: false,
      layoutHeight: null,
      layoutWidth: null,
      marginTop: screenHeight * 0.3,
      openTween: new Animated.Value(0),
      screenHeight,
      screenWidth
    };

    this.headerListRef = null;

    this.calculatePageIndex = this.calculatePageIndex.bind(this);
    this.handleHeaderListRef = this.handleHeaderListRef.bind(this);
    this.handleHeaderScroll = this.handleHeaderScroll.bind(this);
    this.handleIconTap = this.handleIconTap.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
    this.renderHeaderItem = this.renderHeaderItem.bind(this);
  }

  calculatePageIndex(itemWidth, currentOffset) {
    return Math.round(currentOffset / itemWidth);
  }

  componentDidMount() {
    this.close();
  }

  // compare the current selected item with the selected item(s) in the store
  // and return the index.
  getSelectedItemIndex() {
    const selectedItems = this.props.data;
    if (selectedItems.length === 0) {
      return -1;
    }
    const selectedItem = this.props.selectedItem;
    if (!selectedItem || !selectedItem[selectedItem.type]) {
      return -1;
    }

    for (let i = 0; i < selectedItems.length; i++) {
      const si = selectedItems[i];
      if (si.type !== selectedItem.type || !si[si.type]) {
        continue;
      }
      switch (selectedItem.type) {
        case "stop":
          if (si.stop.id === selectedItem.stop.id) {
            return i;
          }
          break;
        case "vehicle":
          if (si.vehicle.vehicle.id === selectedItem.vehicle.vehicle.id) {
            return i;
          }
          break;
        default:
          break;
      }
    }
    return -1;
  }

  // Handle what happens when you tap the image icon to raise and lower details
  handleIconTap() {
    this.openOrClose();
  }

  handleLayout(e) {
    let layoutWidth = e.nativeEvent.layout.width;
    let layoutHeight = e.nativeEvent.layout.height;
    let screenWidth = Dimensions.get("window").width;
    let screenHeight = Dimensions.get("window").height + STATUS_BAR_OFFSET;
    this.setState({
      layoutWidth,
      layoutHeight,
      screenWidth,
      screenHeight,
      marginTop: screenHeight * 0.3
    });

    // Fixes a bug that causes the drawer nav to sit on boundaries when the
    // layout is rotated.
    if (this.headerListRef) {
      this.headerListRef.scrollToIndex({index: 0});
    }
  }

  handleHeaderScroll(e) {
    let idx = this.calculatePageIndex(
      e.nativeEvent.layoutMeasurement.width,
      e.nativeEvent.contentOffset.x
    );
    if (idx !== this.props.selectedItemIndex) {
      this.selectItem(idx);
    }
  }

  handleHeaderListRef(list) {
    this.headerListRef = list;
  }

  openOrClose() {
    if (!this.state.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    // Raise drawer

    Animated.timing(this.state.openTween, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    this.setState({
      isOpen: true
    });

    let height = this.state.screenHeight - this.state.marginTop;
    if (Platform.OS === "android") {
      // Android uses a different pixel measurement than ios
      height = Math.floor(PixelRatio.getPixelSizeForLayoutSize(height));
    }
    this.props.onResize(height);
  }

  close() {
    // close drawer

    Animated.timing(this.state.openTween, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();

    this.setState({
      isOpen: false
    });

    // Trigger layout resize
    this.props.onResize(0);
  }

  renderHeaderItem({item}) {
    if (item.type === "stop") {
      return (
        <StopItem
          width={this.state.layoutWidth}
          onPress={this.handleIconTap}
          stop={item.stop}
        />
      );
    }

    if (item.type === "vehicle") {
      return (
        <VehicleItem
          width={this.state.layoutWidth}
          onPress={this.handleIconTap}
          vehicle={item.vehicle}
        />
      );
    }
  }

  render() {
    let height = this.state.screenHeight - this.state.marginTop;
    let headerHeight = HEADER_HEIGHT;
    let header = null;
    if (this.props.data.length > 1) {
      headerHeight += HEADER_PAGINATION_HEIGHT;
      header = (
        <View style={styles.headerPagination}>
          {headerPagination(
            this.props.data.length,
            this.props.selectedItemIndex
          )}
        </View>
      );
    }
    let offset = Platform.OS === "android" ? 48 : 0;
    let viewStyle = {
      height: height,
      bottom: headerHeight - height,
      transform: [
        {
          translateY: this.state.openTween.interpolate({
            inputRange: [0, 1],
            outputRange: [
              0,
              -this.state.screenHeight + headerHeight + this.state.marginTop
            ]
          })
        }
      ]
    };
    return (
      <Animated.View
        onLayout={this.handleLayout}
        style={[styles.drawer, viewStyle]}>
        <View style={styles.headerView}>
          <FlatList
            ref={this.handleHeaderListRef}
            data={this.props.data}
            style={styles.header}
            renderItem={this.renderHeaderItem}
            extraData={this.state}
            horizontal={true}
            pagingEnabled={true}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleHeaderScroll}
          />
          {header}
        </View>
        <View style={[styles.detailsView]}>
          {this.props.selectedItem.type === "stop" ? (
            <Arrivals selectedStop={this.props.selectedItem} />
          ) : null}
        </View>
      </Animated.View>
    );
  }

  selectItem(idx) {
    this.props.onSelectItemIndex(idx);
  }
}

function mapStateToProps(state) {
  return {
    selectedItem: getSelectedItem(state),
    selectedItemIndex: state.selectedItemIndex
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSelectItemIndex: itemIndex => {
      dispatch(selectItemIndex(itemIndex));
      if (ownProps.onResize) {
        ownProps.onResize(itemIndex);
      }
    },
    onResize: size => {
      dispatch(setMapViewInset(size));
      if (ownProps.onResize) {
        ownProps.onResize();
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedItemsView);

function StopItem(props) {
  let {width, onPress, stop} = props;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        width
      }}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.itemImageContainer}>
          <Image style={styles.itemImage} source={stopImage} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress}>
        <View key={stop.name} style={[styles.itemDescription]}>
          <View>
            <Text style={{fontSize: 18}}>{stop.name}</Text>
          </View>
          <View>
            <Text
              style={{
                color: "#999999",
                fontSize: 14,
                justifyContent: "center"
              }}>
              {stop.desc}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function VehicleItem(props) {
  let {width, vehicle, onPress} = props;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        width
      }}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.itemImageContainer}>
          <Image
            style={styles.itemImage}
            source={VEHICLE_IMAGE[vehicle.route_type]}
          />
          <Text>{vehicle.vehicle.id}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress}>
        <View
          key={vehicle.vehicle.id}
          style={[styles.itemDescription, {flex: 1, flexDirection: "row"}]}>
          <View
            style={{
              padding: 10
            }}>
            <Text style={{fontSize: 36}}>{vehicle.trip.route_id}</Text>
          </View>

          <View>
            <Text style={{fontSize: 20}}>{vehicle.vehicle.label}</Text>
            <Text style={{fontSize: 10}}>
              Updated: {Moment.unix(vehicle.timestamp).fromNow()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    transform: [{perspective: 1000}]
  },
  header: {
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderTopWidth: 1,
    bottom: 0,
    maxHeight: 100,
    height: 100,
    padding: 1
  },
  headerView: {
    borderBottomWidth: 1,
    borderColor: "#CCCCCC"
  },
  detailsView: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    position: "relative",
    top: -8,
    flex: 1
  },
  headerPagination: {
    flexDirection: "row",
    position: "relative",
    maxHeight: 25,
    backgroundColor: "#44FFFF",
    marginLeft: 10,
    marginRight: 10
  },
  inactive: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    flex: 1
  },
  active: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDDDDD",
    flex: 1
  },
  itemDescription: {
    alignItems: "center",
    height: 100,
    paddingLeft: 10,
    paddingRight: 10,
    minHeight: 100,
    flex: 0
  },
  itemImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    maxWidth: 60,
    height: 100,
    backgroundColor: "#EFEFEF"
  },
  itemImage: {
    marginTop: 0,
    padding: 0,
    width: 40,
    resizeMode: "contain",
    height: 40,
    alignItems: "center"
  }
});
