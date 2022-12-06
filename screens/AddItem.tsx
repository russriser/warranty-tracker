import { useRoute } from '@react-navigation/native';
import { useRef, useState, useContext } from 'react';
import {
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  TextInput as DefaultTextInput,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Dropdown from 'react-native-dropdown-picker';
import DatePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import DurationInput from '../components/DurationInput';
import { Text, TextInput, useThemeColor, View } from '../components/Themed';
import { AppData } from '../data/Provider';
import { RootStackScreenProps } from '../types';
import { DurationUnit } from '../types/Duration';
import Item, { ExtendedWarrantyStart, itemLabels } from '../types/Item';
import ImageInput from '../components/ImageInput';

enum Camera {
  item = 'item',
  receipt = 'receipt',
  serial = 'serial',
  warranty = 'warranty',
}

export default function AddItem({
  navigation,
}: RootStackScreenProps<'AddItem'>) {
  const { items, categories, purchaseMethods, addItem, editItem, deleteItem } =
    useContext(AppData);
  const { params } = useRoute();
  const id = params?.id || Date.now();
  const item: Item | undefined = items[id];
  const isEdit = !!item;

  const [category, setCategory] = useState(
    isEdit ? item.category : params?.categoryId || ''
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [description, setDescription] = useState(
    isEdit ? item.description : ''
  );
  const [make, setMake] = useState(isEdit ? item.make : '');
  const [model, setModel] = useState(isEdit ? item.model : '');
  const [serial, setSerial] = useState(isEdit ? item.serial : '');
  const [purchaseDate, setPurchaseDate] = useState(
    isEdit ? item.purchaseDate : new Date()
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState(
    isEdit ? item.purchaseMethod : ''
  );
  const [purchaseMethodOpen, setPurchaseMethodOpen] = useState(false);
  const [warrantyNumUnits, setWarrantyNumUnits] = useState(
    isEdit ? item.manufacturerWarranty.numUnits : 30
  );
  const [warrantyUnit, setWarrantyUnit] = useState(
    isEdit ? item.manufacturerWarranty.unit : DurationUnit.day
  );

  const [tempItemImageUri, setItemImageUri] = useState('');
  const [tempReceiptImageUri, setReceiptImageUri] = useState('');
  const [tempSerialImageUri, setSerialImageUri] = useState('');
  const [tempWarrantyImageUri, setWarrantyImageUri] = useState('');

  const [itemImageDeleted, setItemImageDeleted] = useState(false);
  const [receiptImageDeleted, setReceiptImageDeleted] = useState(false);
  const [serialImageDeleted, setSerialImageDeleted] = useState(false);
  const [warrantyImageDeleted, setWarrantyImageDeleted] = useState(false);

  const [storageLocation, setStorageLocation] = useState(
    isEdit ? item.storageLocation : ''
  );
  const [extendedEnabled, setExtendedEnabled] = useState(
    isEdit ? !!item.extendedWarranty : false
  );
  const [extendedNumUnits, setExtendedNumUnits] = useState(
    item?.extendedWarranty ? item.extendedWarranty?.duration.numUnits : 30
  );
  const [extendedUnit, setExtendedUnit] = useState(
    item?.extendedWarranty
      ? item.extendedWarranty?.duration.unit
      : DurationUnit.day
  );
  const [extendedStartOpen, setExtendedStartOpen] = useState(false);
  const [extendedStart, setExtendedStart] = useState(
    item?.extendedWarranty
      ? item.extendedWarranty?.startDate
      : ExtendedWarrantyStart.expirationDate
  );
  const [notes, setNotes] = useState(isEdit ? item.notes : '');

  const notesRef = useRef<DefaultTextInput>(null);

  const color = useThemeColor({}, 'text');

  const newItemImageUri = `${FileSystem.documentDirectory}images/${id}-${Camera.item}.jpg`;
  const newReceiptImageUri = `${FileSystem.documentDirectory}images/${id}-${Camera.receipt}.jpg`;
  const newSerialImageUri = `${FileSystem.documentDirectory}images/${id}-${Camera.serial}.jpg`;
  const newWarrantyImageUri = `${FileSystem.documentDirectory}images/${id}-${Camera.warranty}.jpg`;

  const draftItem = {
    category,
    description: description || 'Untitled',
    make,
    model,
    serial,
    purchaseDate,
    purchaseMethod,
    manufacturerWarranty: {
      numUnits: warrantyNumUnits,
      unit: warrantyUnit,
    },
    itemImageUri: isEdit ? item.itemImageUri : '',
    receiptImageUri: isEdit ? item.receiptImageUri : '',
    serialImageUri: isEdit ? item.serialImageUri : '',
    warrantyImageUri: isEdit ? item.warrantyImageUri : '',
    storageLocation,
    extendedWarranty: extendedEnabled
      ? {
          duration: {
            numUnits: extendedNumUnits,
            unit: extendedUnit,
          },
          startDate: extendedStart,
        }
      : undefined,
    notes,
  };

  const handleSave = () => {
    if (tempItemImageUri) {
      FileSystem.copyAsync({
        from: tempItemImageUri,
        to: newItemImageUri,
      });
      draftItem.itemImageUri = newItemImageUri;
    } else if (itemImageDeleted) {
      draftItem.itemImageUri = '';
    }

    if (tempReceiptImageUri) {
      FileSystem.copyAsync({
        from: tempReceiptImageUri,
        to: newReceiptImageUri,
      });
      draftItem.receiptImageUri = newReceiptImageUri;
    } else if (receiptImageDeleted) {
      draftItem.receiptImageUri = '';
    }

    if (tempSerialImageUri) {
      FileSystem.copyAsync({
        from: tempSerialImageUri,
        to: newSerialImageUri,
      });
      draftItem.serialImageUri = newSerialImageUri;
    } else if (serialImageDeleted) {
      draftItem.serialImageUri = '';
    }

    if (tempWarrantyImageUri) {
      FileSystem.copyAsync({
        from: tempWarrantyImageUri,
        to: newWarrantyImageUri,
      });
      draftItem.warrantyImageUri = newWarrantyImageUri;
    } else if (warrantyImageDeleted) {
      draftItem.warrantyImageUri = '';
    }

    if (isEdit) {
      editItem({ id, ...draftItem });
    } else {
      addItem(draftItem);
    }
    navigation.goBack();
  };

  const handleDeleteImage = (type: Camera) => {
    switch (type) {
      case Camera.item:
        setItemImageUri('');
        setItemImageDeleted(true);
        FileSystem.deleteAsync(item.itemImageUri);
        break;
      case Camera.receipt:
        setReceiptImageUri('');
        setReceiptImageDeleted(true);
        FileSystem.deleteAsync(item.receiptImageUri);
        break;
      case Camera.serial:
        setSerialImageUri('');
        setSerialImageDeleted(true);
        FileSystem.deleteAsync(item.serialImageUri);
        break;
      case Camera.warranty:
        setWarrantyImageUri('');
        setWarrantyImageDeleted(true);
        FileSystem.deleteAsync(item.warrantyImageUri);
        break;
    }
  };

  const handleDeleteItem = () => {
    deleteItem(id);
    navigation.replace('Home');
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: new Date(purchaseDate),
        mode: 'date',
        onChange: (event, date) => {
          if (date && event.type !== 'dismissed') {
            setPurchaseDate(date);
          }
        },
      });
    } else {
      setDatePickerOpen(true);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.replace('Home')} style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Pressable>
      <Text style={styles.title}>Add Item</Text>

      <Text>{itemLabels.category}</Text>
      <Dropdown
        open={categoryOpen}
        setOpen={setCategoryOpen}
        value={category}
        setValue={setCategory}
        items={Object.values(categories).map(({ id: value, label }) => ({
          value,
          label,
        }))}
      />

      <Text>{itemLabels.description}</Text>
      <TextInput value={description} onChangeText={setDescription} />

      <Text>{itemLabels.make}</Text>
      <TextInput value={make} onChangeText={setMake} />

      <Text>{itemLabels.model}</Text>
      <TextInput value={model} onChangeText={setModel} />

      <Text>{itemLabels.serial}</Text>
      <TextInput value={serial} onChangeText={setSerial} />

      <Text>{itemLabels.purchaseDate}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>{new Date(purchaseDate).toLocaleDateString()}</Text>
        <Pressable
          onPress={showDatePicker}
          style={{ backgroundColor: 'blue', padding: 12 }}
        >
          <Text>select date</Text>
        </Pressable>
        {Platform.OS === 'ios' && datePickerOpen && (
          <DatePicker
            value={new Date(purchaseDate)}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date && event.type !== 'dismissed') {
                setPurchaseDate(date);
              }
            }}
          />
        )}
      </View>

      <Text>{itemLabels.purchaseMethod}</Text>
      <Dropdown
        open={purchaseMethodOpen}
        setOpen={setPurchaseMethodOpen}
        value={purchaseMethod}
        setValue={setPurchaseMethod}
        items={Object.values(purchaseMethods).map(({ id, description }) => ({
          value: id,
          label: description,
        }))}
      />

      <Text>{itemLabels.manufacturerWarranty}</Text>
      <DurationInput
        numUnits={warrantyNumUnits}
        setNumUnits={setWarrantyNumUnits}
        unit={warrantyUnit}
        setUnit={setWarrantyUnit}
      />

      <Text>{itemLabels.itemImageUri}</Text>
      <ImageInput
        imageUri={tempItemImageUri || item?.itemImageUri}
        onImageSelected={(uri: string) => setItemImageUri(uri)}
        onDelete={() => handleDeleteImage(Camera.item)}
      />

      <Text>{itemLabels.receiptImageUri}</Text>
      <ImageInput
        imageUri={tempReceiptImageUri || item?.receiptImageUri}
        onImageSelected={(uri: string) => setReceiptImageUri(uri)}
        onDelete={() => handleDeleteImage(Camera.receipt)}
      />

      <Text>{itemLabels.serialImageUri}</Text>
      <ImageInput
        imageUri={tempSerialImageUri || item?.serialImageUri}
        onImageSelected={(uri: string) => setSerialImageUri(uri)}
        onDelete={() => handleDeleteImage(Camera.serial)}
      />

      <Text>{itemLabels.warrantyImageUri}</Text>
      <ImageInput
        imageUri={tempWarrantyImageUri || item?.warrantyImageUri}
        onImageSelected={(uri: string) => setWarrantyImageUri(uri)}
        onDelete={() => handleDeleteImage(Camera.warranty)}
      />

      <Text>Storage Location for Original Warranty</Text>
      <TextInput value={storageLocation} onChangeText={setStorageLocation} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>In-Store Extrnded Warranty Purchased</Text>
        <Switch value={extendedEnabled} onValueChange={setExtendedEnabled} />
      </View>

      {extendedEnabled && (
        <View style={{ paddingLeft: 16, zIndex: 1 }}>
          <Text>Duration</Text>
          <View style={{ zIndex: 2 }}>
            <DurationInput
              numUnits={extendedNumUnits}
              setNumUnits={setExtendedNumUnits}
              unit={extendedUnit}
              setUnit={setExtendedUnit}
            />
          </View>
          <Text>Coverage Begins</Text>
          <View style={{ zIndex: extendedStartOpen ? 3 : 1 }}>
            <Dropdown
              open={extendedStartOpen}
              setOpen={setExtendedStartOpen}
              value={extendedStart}
              setValue={setExtendedStart}
              items={[
                {
                  value: ExtendedWarrantyStart.purchaseDate,
                  label: 'Purchase Date',
                },
                {
                  value: ExtendedWarrantyStart.expirationDate,
                  label: "Expiration of Manufacturer's Warranty",
                },
              ]}
            />
          </View>
        </View>
      )}

      <Text>Notes</Text>
      <Pressable
        style={{ borderWidth: 1, borderColor: color, height: 200 }}
        onPress={() => notesRef.current?.focus()}
      >
        <TextInput
          ref={notesRef}
          value={notes}
          onChangeText={setNotes}
          style={{ borderWidth: 0 }}
        />
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: 'grey',
            padding: 12,
            margin: 12,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: 'center' }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={{
            backgroundColor: 'green',
            padding: 12,
            margin: 12,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: 'center' }}>Save</Text>
        </Pressable>
      </View>
      {isEdit && (
        <Pressable
          onPress={handleDeleteItem}
          style={{ backgroundColor: 'red', flex: 1, padding: 12, margin: 12 }}
        >
          <Text style={{ textAlign: 'center' }}>Delete</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
