import React, {Component} from "react";
import {connect} from "react-redux";
import Moment from "moment";

import {
  getSelectedItem,
  getVehicleInfoFromArrival,
  getStopInfoFromSelectedItem,
  ROUTE_TYPE_ICONS
} from "./selectors";

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

import {parseArrivalTime} from "./arrivals";

import {
  clearSelection,
  selectItemIndex,
  setSelectedItemsViewHeight
} from "./actions";
import Arrivals from "./arrivals";
import VehicleInfo from "./vehicle_info";
import tram from "./assets/tram.png";
import bus from "./assets/bus.png";
import stopImage from "./assets/stop.png";

const VEHICLE_IMAGE = {
  0: tram,
  3: bus
};

const CURRENT_VEHICLE_STATUS = {
  0: "Incoming at",
  1: "Stopped at",
  2: "In Transit to"
};

const MAP_AREA_OFFSET = 250;
const HEADER_HEIGHT = 100;
const HEADER_PAGINATION_HEIGHT = 25;
const BOTTOM_STATS_BAR_HEIGHT = 40;
const STATUS_BAR_OFFSET = Platform.OS === "android" ? 24 : 0;

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
      marginTop: screenHeight * 0.4,
      openTween: new Animated.Value(0),
      screenHeight,
      screenWidth,
      isScrolling: false
    };

    this.headerListRef = null;
    this.scrollTimeout = null;
    this.headerScrollTimeout = null;

    this.calculatePageIndex = this.calculatePageIndex.bind(this);
    this.handleHeaderListRef = this.handleHeaderListRef.bind(this);
    this.handleHeaderScroll = this.handleHeaderScroll.bind(this);
    this.handleIconTap = this.handleIconTap.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
    this.renderHeaderItem = this.renderHeaderItem.bind(this);
    this.headerPagination = this.headerPagination.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
    this.handleVehicleHeaderPress = this.handleVehicleHeaderPress.bind(this);
  }

  calculatePageIndex(itemWidth, currentOffset) {
    return Math.round(currentOffset / itemWidth);
  }

  componentDidMount() {
    this.close();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItem && nextProps.selectedItem.type === "vehicle") {
      if (this.state.isOpen) {
        this.close();
      }
    }
    if (
      this.props.data.length !== nextProps.data.length &&
      !this.state.isOpen
    ) {
      this.props.onResize(
        HEADER_HEIGHT +
          (nextProps.data.length > 1 ? HEADER_PAGINATION_HEIGHT : 0)
      );
    }
  }

  componentWillUnmount() {
    this.props.onResize(0);
  }

  getItemLayout(data, index) {
    return {
      length: this.state.screenWidth,
      offset: this.state.screenWidth * index,
      index
    };
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
      marginTop: screenHeight * 0.4
    });

    // Fixes a bug that causes the drawer nav to sit on boundaries when the
    // layout is rotated.
    if (this.headerListRef) {
      this.headerListRef.scrollToIndex({index: 0});
    }
  }

  handleHeaderScroll(e) {
    // adding timeout so we dont spam onSelectItemIndex when jumping across many items.
    clearTimeout(this.headerScrollTimeout);
    let idx = this.calculatePageIndex(
      e.nativeEvent.layoutMeasurement.width,
      e.nativeEvent.contentOffset.x
    );
    if (idx !== this.props.selectedItemIndex) {
      this.headerScrollTimeout = setTimeout(() => {
        this.props.onSelectItemIndex(idx);
      }, 100);
    }
  }

  handleHeaderListRef(list) {
    this.headerListRef = list;
  }

  handlePagePress(index) {
    this.headerListRef.scrollToOffset({offset: index * this.state.screenWidth});
  }

  handleVehicleHeaderPress() {
    this.props.onSelectItemIndex(this.props.selectedItemIndex);
  }

  headerPagination(data, index) {
    let pageNav = [];
    for (let i = 0; i < data.length; i++) {
      let style = index === i ? styles.active : styles.inactive;
      let image =
        data[i].type === "stop" ? (
          <Image style={styles.pageIcon} source={stopImage} />
        ) : (
          <Image style={styles.pageIcon} source={bus} />
        );

      pageNav.push(
        <TouchableOpacity
          key={"pgnav-" + i}
          style={styles.pageItem}
          onPress={() => {
            this.handlePagePress(i);
          }}>
          <View style={style}>{image}</View>
        </TouchableOpacity>
      );
    }
    return pageNav;
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

    let height =
      HEADER_HEIGHT +
      (this.props.data.length > 1
        ? HEADER_PAGINATION_HEIGHT
        : BOTTOM_STATS_BAR_HEIGHT);

    // Trigger layout resize
    this.props.onResize(
      HEADER_HEIGHT +
        (this.props.data.length > 1
          ? HEADER_PAGINATION_HEIGHT
          : BOTTOM_STATS_BAR_HEIGHT)
    );
  }

  renderHeaderItem({item}) {
    if (item.type === "stop") {
      return (
        <StopItem
          width={this.state.layoutWidth}
          onPress={this.handleIconTap}
          stop={item.stop}
          selectedArrival={this.props ? this.props.selectedArrival : null}
          arrivals={item.arrivals}
        />
      );
    }

    if (item.type === "vehicle") {
      return (
        <VehicleItem
          width={this.state.layoutWidth}
          onPress={this.handleVehicleHeaderPress}
          vehicle={item.vehicle}
          stopInfo={this.props.selectedVehicleStopInfo}
          following={this.props.following}
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
          {this.headerPagination(this.props.data, this.props.selectedItemIndex)}
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

    let detailsView = null;
    if (this.props.selectedItem.type === "stop") {
      detailsView = <Arrivals selectedStop={this.props.selectedItem} />;
    }
    if (this.props.selectedItem.type === "vehicle") {
      detailsView = <VehicleInfo />;
    }

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
            getItemLayout={this.getItemLayout}
            extraData={this.state}
            horizontal={true}
            pagingEnabled={true}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleHeaderScroll}
          />
          {header}
          <TouchableOpacity
            style={styles.drawerClose}
            onPress={this.props.onClearSelection}>
            <Text style={styles.drawerCloseIcon}>&#x00D7;</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.detailsView]}>{detailsView}</View>
      </Animated.View>
    );
  }
}

function mapStateToProps(state) {
  return {
    following: state.following,
    selectedItem: getSelectedItem(state),
    selectedItemIndex: state.selectedItemIndex,
    selectedArrival: state.selectedArrival,
    selectedArrivalVehicleInfo: getVehicleInfoFromArrival(state),
    selectedVehicleStopInfo: getStopInfoFromSelectedItem(state)
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
      dispatch(setSelectedItemsViewHeight(size));
      if (ownProps.onResize) {
        ownProps.onResize();
      }
    },
    onClearSelection: () => {
      dispatch(clearSelection());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedItemsView);

function StopItem(props) {
  let {width, onPress, stop, selectedArrival, arrivals} = props;
  let nextArrival;
  if (arrivals.length > 0) {
    nextArrival = (
      <Text style={styles.nextArrivalText}>
        Next arrival{" "}
        {parseArrivalTime(arrivals[0].date, arrivals[0].arrival_time).fromNow()}
      </Text>
    );
  } else {
    nextArrival = (
      <Text style={styles.nextArrivalText}>
        No arrivals within the next hour
      </Text>
    );
  }

  return (
    <TouchableOpacity style={[styles.stopItem, {width}]} onPress={onPress}>
      <View key={stop.name} style={[styles.itemDescription]}>
        <View>
          <Text numberOfLines={1} style={styles.itemDescriptionText}>
            {stop.name}
          </Text>
        </View>
        <View style={styles.itemDescriptionIcon}>
          <Image style={styles.itemImage} source={stopImage} />
          <View>
            <Text style={styles.itemStopInformation}>
              {stop.direction}bound (Stop ID: {stop.id})
            </Text>
            {nextArrival}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VehicleItem(props) {
  let {width, vehicle, onPress, onClear, stopInfo, following} = props;
  return (
    <TouchableOpacity style={[styles.vehicleItem, {width}]} onPress={onPress}>
      <View key={vehicle.vehicle.id} style={[styles.itemDescription]}>
        <View>
          <Text style={styles.vehicleItemLabel}>{vehicle.vehicle.label}</Text>
          <View style={styles.vehicleItemIcon}>
            <Image
              style={[
                styles.itemImage,
                {
                  borderWidth: following ? 2 : 0,
                  borderRadius: 10,
                  borderColor: "#rgba(0, 255,255,0.7)"
                }
              ]}
              source={VEHICLE_IMAGE[vehicle.route_type]}
            />
            <View style={styles.vehicleItemInformation}>
              <Text style={styles.vehicleItemInformationText}>
                {vehicle.vehicle.id}{" "}
                {CURRENT_VEHICLE_STATUS[vehicle.current_status]} {stopInfo.name}
              </Text>
              <Text style={styles.itemVehicleUpdatedText}>
                Updated: {Moment.unix(vehicle.timestamp).fromNow()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    transform: [{perspective: 1000}],
    zIndex: 60,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  drawerClose: {
    flex: 0,
    margin: 5,
    marginRight: 5,
    padding: 8,
    position: "absolute",
    right: 0,
    zIndex: 200
  },
  drawerCloseIcon: {
    color: "#AAAAAA",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24
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
    borderBottomWidth: 0,
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
    height: 25,
    backgroundColor: "#efefef",
    marginLeft: 10,
    marginRight: 10
  },
  pageItem: {
    alignItems: "center",
    backgroundColor: "#fefefe",
    justifyContent: "center",
    flex: 1
  },
  inactive: {
    opacity: 0.2
  },
  active: {
    opacity: 1
  },
  nextArrivalText: {
    color: "#999999",
    fontSize: 13
  },
  itemDescription: {
    height: 100,
    padding: 10,
    justifyContent: "center",
    minHeight: 100,
    flex: 0
  },
  itemDescriptionIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  itemDescriptionText: {
    fontSize: 18,
    paddingRight: 20,
    paddingLeft: 4
  },

  itemStopInformation: {
    color: "#444444",
    fontSize: 13,
    paddingTop: 5
  },

  itemVehicleUpdatedText: {
    color: "#acacac",
    fontSize: 10,
    padding: 5,
    paddingTop: 0
  },
  itemImage: {
    height: 25,
    marginTop: 0,
    padding: 0,
    paddingRight: 10,
    resizeMode: "contain",
    width: 25
  },
  pageIcon: {
    alignItems: "center",
    height: 15,
    margin: 0,
    padding: 10,
    resizeMode: "contain",
    width: 15
  },
  stopItem: {
    flex: 1,
    flexDirection: "row",
    maxWidth: "85%"
  },
  vehicleItem: {
    flex: 1,
    flexDirection: "row"
  },
  vehicleItemLabel: {
    fontSize: 18,
    paddingRight: 20
  },
  vehicleItemIcon: {
    flexDirection: "row",
    marginTop: 5
  },
  vehicleItemInformationText: {
    color: "#222222",
    fontSize: 14,
    paddingLeft: 5,
    paddingTop: 0
  },
  vehicleItemInformation: {
    flexDirection: "column",
    justifyContent: "flex-start"
  }
});
