import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import GetAppIcon from '@material-ui/icons/GetApp';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Fab from '@material-ui/core/Fab';
import LeftColExpansionPanel from '../components/LeftColExpansionPanel';
import HTMLComponentPanel from '../components/HTMLComponentPanel';
import * as actions from '../actions/components';
import { ComponentInt, ComponentsInt, StoreConfigInterface, StoreInterface } from '../utils/InterfaceDefinitions';
import createModal from '../utils/createModal.util';
import cloneDeep from '../utils/cloneDeep';

// /////// FOR TESTING ONLY//////////////////////////

const dummyFilePath = '/Users/jacobrichards/Desktop/';
// ///////////////////////////////////////////////////


interface PropsInt {
  components: ComponentsInt;
  focusComponent: ComponentInt;
  selectableChildren: Array<number>;
  storeConfig: StoreConfigInterface;
  classes: any;
  addComponent: any;
  addChild: any;
  deleteChild: any;
  changeFocusComponent: any;
  changeFocusChild: any;
  deleteComponent: any;
  createApp: any;
  deleteAllData: any;
}

interface StateInt {
  componentName: string;
  modal: any;
  genOptions: Array<string>;
  genOption: number;
}

const mapStateToProps = (store: StoreInterface) => ({
  components: store.workspace.components,
  storeConfig: store.workspace.storeConfig
})

const mapDispatchToProps = (dispatch: any) => ({
  addComponent: ({ title }: { title: string }) => dispatch(actions.addComponent({ title })),
  addChild: ({
    title,
    childType,
    HTMLInfo,
  }: {
  title: string;
  childType: string;
  HTMLInfo: object;
  }) => dispatch(actions.addChild({ title, childType, HTMLInfo })),
  deleteChild: (childId: number) => dispatch(actions.deleteChild(childId)),
  changeFocusComponent: ({ title }: { title: string }) => dispatch(actions.changeFocusComponent({ title })),
  changeFocusChild: ({ childId }: { childId: number }) => dispatch(actions.changeFocusChild({ childId })),
  deleteComponent: ({
    componentId,
    stateComponents,
  }: {
  componentId: number;
  stateComponents: ComponentsInt;
  }) => dispatch(actions.deleteComponent({ componentId, stateComponents })),
  deleteAllData: () => dispatch(actions.deleteAllData()),
  createApp: ({
    path,
    components,
    genOption,
    appName,
    exportAppBool,
    storeConfig,
  }: {
  path: string;
  components: ComponentsInt;
  genOption: number;
  appName: string;
  exportAppBool: boolean;
  storeConfig: StoreConfigInterface;
  }) => {
    return dispatch(
      actions.createApplication({
        path,
        components,
        genOption,
        appName,
        exportAppBool,
        storeConfig,
      }),
    );
  },
});

export class LeftContainer extends Component<PropsInt, StateInt> {
  state: StateInt;

  constructor(props: PropsInt) {
    super(props);

    this.state = {
      componentName: '',
      modal: null,
      genOptions: ['export components', 'export app files & components'],
      genOption: 0,
    };
  }

  handleChange = (event: any) => {
    if(event.target.value.length < 18){
      const newValue: string = event.target.value;
      this.setState({componentName: newValue});
    }
  };

  handleAddComponent = () => {
    this.props.addComponent({ title: this.state.componentName });
    this.setState({
      componentName: '',
    });
  };

  closeModal = () => this.setState({ modal: null });

  clearWorkspace = () => {
    this.setState({
      modal: createModal({
        message: 'delete all data?',
        closeModal: this.closeModal,
        secBtnLabel: 'clear workspace',
        open: true,
        children: null, 
        primBtnAction: null,
        primBtnLabel: null,
        secBtnAction: () => {
          this.props.deleteAllData();
          this.closeModal();
        },
      }),
    });
  };

  chooseGenOptions = (genOption: number) => {
    // set option
    this.setState({ genOption });
    // closeModal
    this.closeModal();
    // Choose app dir
      const { components, storeConfig } = this.props;
      // const { genOption } = this.state;
      const appName = 'exported_preducks_app';
      const exportAppBool = true;
      this.props.createApp({
        path: '',
        components,
        genOption,
        appName,
        exportAppBool,
        storeConfig
      });
  };

  showGenerateAppModal = () => {
    const { chooseGenOptions } = this;
    chooseGenOptions(1);
  };

  render(): JSX.Element {
    const {
      components,
      deleteComponent,
      focusComponent,
      classes,
      addChild,
      deleteChild,
      changeFocusComponent,
      changeFocusChild,
      selectableChildren,
    } = this.props;
    const { componentName, modal } = this.state;

    const leftColExpansionPanels = cloneDeep(components)
      .sort((b: ComponentInt, a: ComponentInt) => b.id - a.id) // sort by id value of comp
      .map((component: ComponentInt, i: number) => (
        <LeftColExpansionPanel
          key={component.id}
          index={i}
          id={component.id}
          component={component}
          focusComponent={focusComponent}
          addChild={addChild}
          deleteChild={deleteChild}
          changeFocusComponent={changeFocusComponent}
          changeFocusChild={changeFocusChild}
          selectableChildren={selectableChildren}
          deleteComponent={deleteComponent}
          components={components}
        />
      ));

    const addComponent = (<Grid
      container
      spacing={8}
      alignItems="center"
      direction="row"
      justify="space-around">
      <Grid item xs={8}>
        <TextField
          id="title-input"
          label="add component"
          placeholder="component name"
          margin="normal"
          autoFocus
          onChange={this.handleChange}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              this.handleAddComponent();
              ev.preventDefault();
            }
          }}
          value={componentName}
          name="componentName"
          className={classes.light}
          InputProps={{
            className: classes.input,
          }}
          InputLabelProps={{
            className: classes.input,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <Fab
          size="medium"
          color="secondary"
          className={classes.button}
          aria-label="Add"
          onClick={this.handleAddComponent}
          disabled={!this.state.componentName}>
          <AddIcon />
        </Fab>
      </Grid>
    </Grid>);

    const clearAndExportButtons = (<div
      style={{
        width: '100%',
        alignSelf: 'flex-end'
      }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <Button
          color="primary"
          aria-label="Export Code"
          variant="contained"
          fullWidth
          onClick={this.showGenerateAppModal}
          className={classes.clearButton}
          style={{ borderRadius: '10px', margin: '2px', color: 'black', backgroundColor: '#5CDB95' }}>
          <GetAppIcon style={{ paddingRight: '5px' }} />
          export project
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <Button
          aria-label="Delete All"
          variant="contained"
          fullWidth
          onClick={this.clearWorkspace}
          className={classes.clearButton}
          style={{  borderRadius: '10px', margin: '2px', color: 'white', backgroundColor: '#F64C72' }}>
          clear workspace
        </Button>
      </div>
    </div>);

    return (
      <div className="column left">
          {addComponent}
          <div className="expansionPanel">{leftColExpansionPanels}</div>
        <HTMLComponentPanel
            addChild={addChild}
            focusComponent={focusComponent}
            />
        {clearAndExportButtons}
        {modal}
      </div>
    );
  }
}

function styles(): any {
  return {
    cssLabel: {
      color: 'white',

      '&$cssFocused': {
        color: 'green',
      },
    },
    cssFocused: {},
    input: {
      color: '#fff',
      opacity: '0.7',
      marginBottom: '10px',
    },
    underline: {
      color: 'white',
      '&::before': {
        color: 'white',
      },
    },
    button: {
      color: '#fff',

      '&:disabled': {
        color: 'grey',
      },
    },
    clearButton: {
      top: '96%',
      position: 'sticky!important',
      zIndex: '1',

      '&:disabled': {
        color: 'grey',
        backgroundColor: '#424242',
      },
    },
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(LeftContainer);
