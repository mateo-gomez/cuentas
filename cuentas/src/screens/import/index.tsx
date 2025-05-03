import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native"
import { AppBar, BackButton, StyledText } from "../../Components"
import { useState } from "react"
import * as DocumentPicker from "expo-document-picker"
import { importTransactions } from "../../services"

const Import = () => {
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0])
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error)
      Alert.alert("Error", "No se pudo seleccionar el archivo.")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      return Alert.alert("Por favor selecciona un archivo primero.")
    }

    setUploading(true)

    const formData = new FormData()
    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type:
        selectedFile.mimeType ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    } as any)

    try {
      const response = await importTransactions(formData)

      Alert.alert("Éxito", "Archivo subido correctamente.")
      setSelectedFile(null)
    } catch (err) {
      console.error("Error al subir archivo:", err)
      Alert.alert("Error", "No se pudo subir el archivo.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar style={{ flexDirection: "row" }}>
        <BackButton />

        <StyledText color="white" fontWeight="bold">
          Importar
        </StyledText>
      </AppBar>

      <View style={styles.container}>
        <Button title="Seleccionar archivo Excel" onPress={handlePickFile} />
        {selectedFile && (
          <StyledText style={styles.fileName}>
            📄 {selectedFile.name}
          </StyledText>
        )}

        <View style={styles.spacer} />

        <Button
          title={uploading ? "Subiendo..." : "Subir archivo"}
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
        />

        {uploading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  fileName: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  spacer: {
    height: 20,
  },
  loader: {
    marginTop: 20,
  },
})

export default Import
