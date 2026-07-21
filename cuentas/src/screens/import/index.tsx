import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useEffect, useState } from "react"
import * as DocumentPicker from "expo-document-picker"
import { appendPickedFile } from "../../utils/appendPickedFile"
import { notify } from "../../utils/notify"
import { importTransactions } from "../../services"
import { usePdfImport } from "../../hooks"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Import")

const Import = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pdfAsset, setPdfAsset] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [password, setPassword] = useState("")
  const { parseState, parse } = usePdfImport()

  useEffect(() => {
    if (parseState.status === "parsed") {
      navigate("/import/pdf", { state: { result: parseState.result } })
    } else if (parseState.status === "unsupported") {
      notify.error("Banco no soportado", parseState.message)
    } else if (parseState.status === "error") {
      notify.error("Error", parseState.message)
    }
    // parseState "password_required" is handled inline in the UI below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseState])

  const runPdfParse = async (
    asset: DocumentPicker.DocumentPickerAsset,
    pdfPassword?: string,
  ) => {
    const formData = new FormData()
    appendPickedFile(formData, asset, "application/pdf")

    if (pdfPassword) {
      formData.append("password", pdfPassword)
    }

    await parse(formData)
  }

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
      notify.error("Error", "No se pudo seleccionar el archivo.")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      return notify.error("Por favor selecciona un archivo primero.")
    }

    setUploading(true)

    const formData = new FormData()
    appendPickedFile(
      formData,
      selectedFile,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    try {
      const response = await importTransactions(formData)

      notify.success("Éxito", "Archivo subido correctamente.")
      setSelectedFile(null)
    } catch (err) {
      logger.error("Error uploading file", { error: err })
      notify.error(
        "Error",
        err instanceof Error ? err.message : "No se pudo subir el archivo.",
      )
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
      setPdfAsset(file)
      setPassword("")
      await runPdfParse(file)
    } catch (error) {
      logger.error("Error selecting PDF file", { error })
      notify.error("Error", "No se pudo seleccionar el archivo.")
    }
  }

  const handleSubmitPassword = async () => {
    if (!pdfAsset || password.trim().length === 0) {
      return
    }
    await runPdfParse(pdfAsset, password.trim())
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
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Importar</Text>
      </View>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.hint}>
            Seleccioná un archivo Excel para importar tus transacciones.
          </Text>

          <TouchableOpacity style={styles.pickButton} onPress={handlePickFile}>
            <Ionicons name="document-outline" size={20} color={theme.palette.ink} />
            <Text style={styles.pickButtonText}>Seleccionar archivo Excel</Text>
          </TouchableOpacity>

          {selectedFile ? (
            <View style={styles.fileChip}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={theme.palette.ink3}
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploadDisabled && styles.uploadButtonDisabled,
            ]}
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
              color={theme.palette.accent}
              style={styles.loader}
            />
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.hint}>
            O importá un extracto bancario en PDF (Bancolombia, Davibank o
            Rappi).
          </Text>

          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickAndParsePdf}
            disabled={parsingPdf}
          >
            <Ionicons
              name="document-attach-outline"
              size={20}
              color={theme.palette.ink}
            />
            <Text style={styles.pickButtonText}>
              {parsingPdf ? "Procesando..." : "Seleccionar extracto PDF"}
            </Text>
          </TouchableOpacity>

          {parsingPdf ? (
            <ActivityIndicator
              size="large"
              color={theme.palette.accent}
              style={styles.loader}
            />
          ) : null}

          {parseState.status === "password_required" ? (
            <View style={styles.passwordBox}>
              <Text style={styles.hint}>
                {parseState.message} Ingresá la clave para desbloquearlo.
              </Text>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña del PDF"
                placeholderTextColor={theme.palette.ink4}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSubmitPassword}
              />
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  password.trim().length === 0 && styles.uploadButtonDisabled,
                ]}
                onPress={handleSubmitPassword}
                disabled={password.trim().length === 0}
              >
                <Text style={styles.uploadButtonText}>
                  Desbloquear y procesar
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  flex: {
    flex: 1,
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
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.palette.ink,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  hint: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.palette.ink3,
    lineHeight: 20,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    paddingVertical: 14,
  },
  pickButtonText: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: theme.palette.ink,
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.palette.surface3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fileName: {
    flex: 1,
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.palette.ink2,
  },
  uploadButton: {
    backgroundColor: theme.palette.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.4,
  },
  uploadButtonText: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: theme.palette.onAccent,
  },
  loader: {
    marginTop: 8,
  },
  passwordBox: {
    gap: 10,
    marginTop: 4,
  },
  passwordInput: {
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.palette.ink,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.line,
    marginVertical: 8,
  },
  })

export default Import
