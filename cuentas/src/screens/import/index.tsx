import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router-native"
import grafito from "../../theme"
import { useEffect, useState } from "react"
import * as DocumentPicker from "expo-document-picker"
import { importTransactions } from "../../services"
import { usePdfImport } from "../../hooks"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Import")

const Import = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)
  const { parseState, parse } = usePdfImport()

  useEffect(() => {
    if (parseState.status === "parsed") {
      navigate("/import/pdf", { state: { result: parseState.result } })
    } else if (parseState.status === "unsupported") {
      Alert.alert("Banco no soportado", parseState.message)
    } else if (parseState.status === "error") {
      Alert.alert("Error", parseState.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseState])

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
      logger.error("Error selecting file", { error })
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
      logger.error("Error uploading file", { error: err })
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo subir el archivo.")
    } finally {
      setUploading(false)
    }
  }

  const handlePickAndParsePdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      })

      if (result.canceled || result.assets.length === 0) {
        return
      }

      const file = result.assets[0]
      const formData = new FormData()
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
      } as any)

      await parse(formData)
    } catch (error) {
      logger.error("Error selecting PDF file", { error })
      Alert.alert("Error", "No se pudo seleccionar el archivo.")
    }
  }

  const parsingPdf = parseState.status === "parsing"
  const uploadDisabled = !selectedFile || uploading

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={grafito.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Importar</Text>
      </View>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <View style={styles.container}>
        <Text style={styles.hint}>
          Seleccioná un archivo Excel para importar tus transacciones.
        </Text>

        <TouchableOpacity style={styles.pickButton} onPress={handlePickFile}>
          <Ionicons name="document-outline" size={20} color={grafito.ink} />
          <Text style={styles.pickButtonText}>Seleccionar archivo Excel</Text>
        </TouchableOpacity>

        {selectedFile ? (
          <View style={styles.fileChip}>
            <Ionicons name="document-text-outline" size={18} color={grafito.ink3} />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.uploadButton, uploadDisabled && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploadDisabled}
        >
          <Text style={styles.uploadButtonText}>
            {uploading ? "Subiendo..." : "Subir archivo"}
          </Text>
        </TouchableOpacity>

        {uploading ? (
          <ActivityIndicator
            size="large"
            color={grafito.accent}
            style={styles.loader}
          />
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.hint}>
          O importá un extracto bancario en PDF (Bancolombia).
        </Text>

        <TouchableOpacity
          style={styles.pickButton}
          onPress={handlePickAndParsePdf}
          disabled={parsingPdf}
        >
          <Ionicons name="document-attach-outline" size={20} color={grafito.ink} />
          <Text style={styles.pickButtonText}>
            {parsingPdf ? "Procesando..." : "Seleccionar extracto PDF"}
          </Text>
        </TouchableOpacity>

        {parsingPdf ? (
          <ActivityIndicator
            size="large"
            color={grafito.accent}
            style={styles.loader}
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  hint: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.ink3,
    lineHeight: 20,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: grafito.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    paddingVertical: 14,
  },
  pickButtonText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: grafito.ink,
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: grafito.surface3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fileName: {
    flex: 1,
    fontFamily: grafito.fonts.mono,
    fontSize: 13,
    color: grafito.ink2,
  },
  uploadButton: {
    backgroundColor: grafito.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.4,
  },
  uploadButtonText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: grafito.onAccent,
  },
  loader: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: grafito.line,
    marginVertical: 8,
  },
})

export default Import
