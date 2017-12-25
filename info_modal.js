import React, {Component} from "react";
import {
  Animated,
  Button,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";

import repoImage from "./assets/repo.png";
import trimetImage from "./assets/trimet.png";
import {updateLayerVisibility, toggleInfoModalVisibility} from "./actions";
import {getVehiclePoints, getSelectedItem} from "./selectors";

const FADE_DURATION = 300;

class InfoModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fadeTween: new Animated.Value(0),
      visible: false
    };

    this.timeout = null;

    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleDismissPress = this.handleDismissPress.bind(this);
    this.handleMobilePress = this.handleMobilePress.bind(this);
    this.handleServerPress = this.handleServerPress.bind(this);
    this.handleTrimetPress = this.handleTrimetPress.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.infoModalVisible === nextProps.infoModalVisible) {
      return;
    }

    if (nextProps.infoModalVisible) {
      this.fadeIn();
    } else {
      this.fadeOut();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  fadeIn() {
    clearTimeout(this.timeout);
    this.state.fadeTween.setValue(0);
    Animated.timing(this.state.fadeTween, {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true
    }).start();
    this.setState({visible: true});
  }

  fadeOut() {
    this.state.fadeTween.setValue(1);
    Animated.timing(this.state.fadeTween, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true
    }).start();

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.handleDismiss();
    }, FADE_DURATION);
  }

  handleDismissPress() {
    this.props.onToggleModalVisibility();
  }

  handleDismiss() {
    this.setState({visible: false});
  }

  handleMobilePress() {
    Linking.openURL("https://github.com/bsdavidson/trimetric-mobile");
  }

  handleServerPress() {
    Linking.openURL("https://github.com/bsdavidson/trimetric");
  }

  handleTrimetPress() {
    Linking.openURL("https://trimet.org");
  }

  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <Animated.View
        style={[
          styles.background,
          {
            opacity: this.state.fadeTween.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            })
          }
        ]}>
        <Modal
          visible={this.props.infoModalVisible}
          transparent={true}
          onDismiss={this.handleDismiss}
          onRequestClose={this.handleDismissPress}
          supportedOrientations={[
            "portrait",
            "portrait-upside-down",
            "landscape",
            "landscape-left",
            "landscape-right"
          ]}
          animationType="slide">
          <View style={[styles.container]}>
            <ScrollView>
              <Text style={styles.title}>trimetric</Text>
              <View style={styles.paragraph}>
                <Text style={styles.text}>
                  Trimetric is a realtime visualization of the Trimet public
                  transit system in Portland, OR.
                </Text>
              </View>
              <TouchableOpacity
                onPress={this.handleTrimetPress}
                style={styles.paragraph}>
                <Image style={styles.trimetImage} source={trimetImage} />
                <Text style={styles.text}>
                  The data comes from static and realtime GTFS feeds provided by{" "}
                  <Text style={{textDecorationLine: "underline"}}>
                    Trimet's API
                  </Text>.
                </Text>
              </TouchableOpacity>
              <View style={styles.paragraph}>
                <Text style={styles.text}>
                  Trimetric's backend, mobile app and website are open source
                  and you can find the code on GitHub:
                </Text>
              </View>
              <View style={styles.paragraph}>
                <TouchableOpacity
                  onPress={this.handleMobilePress}
                  style={styles.button}>
                  <Image style={styles.buttonImage} source={repoImage} />
                  <Text style={styles.buttonText}>
                    Trimetric Mobile Repository
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.paragraph}>
                <TouchableOpacity
                  onPress={this.handleServerPress}
                  style={styles.button}>
                  <Image style={styles.buttonImage} source={repoImage} />
                  <Text style={styles.buttonText}>
                    Trimetric Server Repository
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={this.handleDismissPress}>
              <Text style={styles.dismissButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Animated.View>
    );
  }
}

function mapStateToProps(state) {
  return {
    infoModalVisible: state.infoModalVisible
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleModalVisibility: visible => {
      dispatch(toggleInfoModalVisibility());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoModal);

const styles = StyleSheet.create({
  background: {
    backgroundColor: "rgba(0,0,0,0.5)",
    bottom: 0,
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 100
  },
  container: {
    backgroundColor: "#34495e",
    borderRadius: 15,
    bottom: "15%",
    left: "10%",
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    position: "absolute",
    right: "10%",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    top: "10%",
    zIndex: 100
  },
  title: {
    color: "#ecf0f1",
    fontFamily: "Allerta Stencil",
    fontSize: 34,
    marginBottom: 10
  },
  text: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    padding: 5
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3
  },
  buttonImage: {
    height: 15,
    marginTop: 4,
    width: 15
  },
  dismissButton: {
    alignItems: "center",
    padding: 10
  },
  dismissButtonText: {
    alignItems: "center",
    borderColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    borderWidth: 1,
    color: "#FFFFFF",
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30
  },
  paragraph: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15
  },
  trimetImage: {
    height: 50,
    marginRight: 10,
    width: 50
  }
});
