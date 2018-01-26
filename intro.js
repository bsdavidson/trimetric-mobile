import React, {Component} from "react";
import {
  Animated,
  Button,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";

import {updateLayerVisibility, setSeenIntroSeen} from "./actions";
import Loading from "./loading";

import busIcon from "./assets/bus.png";
import layersIcon from "./assets/layers.png";
import mapIcon from "./assets/map.png";
import stopIcon from "./assets/stop.png";
import trainIcon from "./assets/tram.png";

export class Intro extends Component {
  state = {
    visible: true,
    screenIndex: 0,
    scrollTween: new Animated.Value(0)
  };

  screenWidth = Dimensions.get("window").width;

  constructor(props) {
    super(props);

    this.handleNextPress = this.handleNextPress.bind(this);
    this.handleResetPress = this.handleResetPress.bind(this);
    this.handleTogglePress = this.handleTogglePress.bind(this);
  }

  componentDidMount() {
    this.setScreenIndex(0);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.screenIndex === 3) {
      this.props.onSeenIntro();
    }
  }

  componentDidUpdate() {
    if (
      this.props.loaded &&
      this.state.visible &&
      (this.state.screenIndex > 3 || this.props.seenIntro)
    ) {
      this.setState({
        visible: false
      });
    }
  }

  handleTogglePress() {
    this.setState({visible: !this.state.visible});
  }

  handleNextPress() {
    this.setScreenIndex(this.state.screenIndex + 1);
  }

  handleResetPress() {
    this.setScreenIndex(0);
  }

  setScreenIndex(screenIndex) {
    this.state.scrollTween.setValue(0);
    Animated.timing(this.state.scrollTween, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    this.setState({screenIndex});
  }

  renderTitle() {
    return (
      <View style={styles.title}>
        <View style={styles.titleTextView}>
          <Text style={styles.titleText}>trimetric</Text>
        </View>
        <Loading />
      </View>
    );
  }

  renderScreens(screenWidth) {
    if (this.props.skipTips || this.props.seenIntro) {
      return null;
    }
    return (
      <Animated.View
        style={{
          width: screenWidth * 4,
          height: 300,
          transform: [
            {
              translateX: this.state.scrollTween.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  (this.state.screenIndex - 1) * screenWidth * -1,
                  this.state.screenIndex * screenWidth * -1
                ]
              })
            }
          ],
          flex: 1,
          flexDirection: "row"
        }}>
        <View style={[styles.screen, {width: screenWidth}]}>
          <View style={styles.screenPage}>
            <Image style={styles.mapImage} source={mapIcon} />
            <Text style={[styles.screenText, {marginTop: 10}]}>
              Trimetric is an open source visualization that lets you watch
              what's going on in Portland's transit system in real-time.
            </Text>
            <View style={styles.nextButton}>
              <Button title="Next" onPress={this.handleNextPress} />
            </View>
          </View>
        </View>

        <View style={[styles.screen, {width: screenWidth}]}>
          <View style={styles.screenPage}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Image
                resizeMode={"contain"}
                style={styles.vehicleImage}
                source={busIcon}
              />
              <Image
                resizeMode={"contain"}
                style={styles.vehicleImage}
                source={trainIcon}
              />
            </View>
            <Text style={styles.screenTextHeader}>
              These icons are vehicles.
            </Text>
            <Text style={[styles.screenText]}>
              Tapping on them will follow them as they drive around&nbsp;town.
            </Text>
            <View style={styles.nextButton}>
              <Button title="Next" onPress={this.handleNextPress} />
            </View>
          </View>
        </View>
        <View style={[styles.screen, {width: screenWidth}]}>
          <View style={styles.screenPage}>
            <Image
              resizeMode={"contain"}
              style={styles.stopImage}
              source={stopIcon}
            />
            <Text style={[styles.screenTextHeader]}>
              These icons are stops.
            </Text>
            <Text style={[styles.screenText]}>
              Tapping on them will show you upcoming arrivals and how far away
              they are from the&nbsp;stop.
            </Text>
            <View style={styles.nextButton}>
              <Button title="Next" onPress={this.handleNextPress} />
            </View>
          </View>
        </View>
        <View style={[styles.screen, {width: screenWidth}]}>
          <View style={styles.screenPage}>
            <Image
              resizeMode={"contain"}
              style={styles.layersImage}
              source={layersIcon}
            />
            <Text style={[styles.screenTextHeader, {marginTop: 0}]}>
              This is the layers menu.
            </Text>
            <Text style={[styles.screenText]}>
              The map will show you many details, which you can show or hide
              using this&nbsp;menu.
            </Text>
            <View style={styles.nextButton}>
              <Button title="Okay, let's go!" onPress={this.handleNextPress} />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  render() {
    const screenWidth = this.props.dimensions.window.width;
    if (!this.state.visible) {
      return null;
    }

    return (
      <View
        style={{
          backgroundColor: "#34495e",
          bottom: 0,
          height: "100%",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 99
        }}>
        <StatusBar barStyle="light-content" />
        {this.renderTitle()}
        {this.renderScreens(screenWidth)}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    dimensions: state.dimensions,
    layerVisibility: state.layerVisibility,
    loaded: state.loaded,
    seenIntro: state.seenIntro
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onUpdateLayerVisibility: (layerName, value) => {
      dispatch(updateLayerVisibility(layerName, value));
    },
    onSeenIntro: () => {
      dispatch(setSeenIntroSeen());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Intro);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    elevation: 4,
    left: 35,
    maxWidth: 600,
    padding: 10,
    position: "absolute",
    right: 35,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    top: 105,
    zIndex: 100
  },
  screen: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 30,
    paddingBottom: 50
  },
  screenText: {
    color: "#222222",
    fontSize: 16,
    marginTop: 15,
    textAlign: "center"
  },
  screenTextHeader: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center"
  },
  screenPage: {
    alignItems: "center",
    backgroundColor: "#efefef",
    borderRadius: 12,
    flex: 0,
    padding: 15,
    paddingLeft: 15,
    paddingRight: 15,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  title: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end"
  },
  titleText: {
    color: "#ecf0f1",
    flex: 0,
    fontFamily: "Allerta Stencil",
    fontSize: 50,
    marginBottom: 20
  },
  titleTextView: {
    flex: 1,
    justifyContent: "flex-end"
  },
  nextButton: {
    marginTop: 5
  },
  vehicleImage: {
    flex: 1,
    height: 60,
    margin: 5,
    marginTop: 2,
    width: 60
  },
  mapImage: {
    borderColor: "#AAAAAA",
    borderRadius: 6,
    borderWidth: 1,
    height: 75,
    margin: 5,
    marginTop: 2,
    padding: 10,
    width: 200
  },
  stopImage: {
    height: 60,
    margin: 5,
    marginTop: 2,
    width: 60
  },
  layersImage: {
    height: 80,
    margin: 5,
    marginTop: 2,
    width: 80
  }
});
