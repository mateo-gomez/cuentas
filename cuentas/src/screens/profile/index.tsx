import { useState } from "react"
import {
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
import { Button } from "../../Components/Button"
import { ErrorBanner } from "../../Components"
import { useProfile } from "../../hooks"

const Profile = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { user, loading, error, save, changePassword } = useProfile()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [surename, setSurename] = useState(user?.surename ?? "")
  const [lastname, setLastname] = useState(user?.lastname ?? "")
  const [savingProfile, setSavingProfile] = useState(false)

  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  const startEditing = () => {
    setName(user?.name ?? "")
    setSurename(user?.surename ?? "")
    setLastname(user?.lastname ?? "")
    setEditing(true)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await save({ name, surename, lastname })
      setEditing(false)
    } catch {
      // error already surfaced via useProfile().error
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setSavingPassword(true)
    setPasswordSuccess("")
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess("Contraseña actualizada")
      setCurrentPassword("")
      setNewPassword("")
      setChangingPassword(false)
    } catch {
      // error already surfaced via useProfile().error
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.section}>
        {editing ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido paterno"
              value={surename}
              onChangeText={setSurename}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido materno"
              value={lastname}
              onChangeText={setLastname}
            />
            <View style={styles.formActions}>
              <Button
                onPress={handleSaveProfile}
                loading={savingProfile}
                disabled={savingProfile}
              >
                <Text style={styles.buttonLabel}>Guardar</Text>
              </Button>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelLabel}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.name}>
              {user?.name} {user?.surename} {user?.lastname}
            </Text>
            {/* Email is READ-ONLY by design — no input, no edit affordance. */}
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity onPress={startEditing} style={styles.editLink}>
              <Ionicons
                name="pencil-outline"
                size={16}
                color={theme.palette.accent}
              />
              <Text style={styles.editLinkLabel}>Editar datos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => setChangingPassword((prev) => !prev)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
          <Ionicons
            name={changingPassword ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.palette.ink3}
          />
        </TouchableOpacity>

        {changingPassword ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña nueva (mínimo 8 caracteres)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Button
              onPress={handleChangePassword}
              loading={savingPassword}
              disabled={savingPassword}
            >
              <Text style={styles.buttonLabel}>Actualizar contraseña</Text>
            </Button>
          </View>
        ) : null}

        {passwordSuccess ? (
          <Text style={styles.success}>{passwordSuccess}</Text>
        ) : null}
      </View>

      <ErrorBanner message={loading ? "" : error} />

      <View style={styles.spacer} />
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.bg,
    },
    spacer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontFamily: theme.fonts.serif,
      fontSize: 22,
      color: theme.palette.ink,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink,
    },
    name: {
      fontFamily: theme.fonts.serif,
      fontSize: 20,
      color: theme.palette.ink,
    },
    email: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      color: theme.palette.ink3,
      marginTop: 4,
    },
    editLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
    },
    editLinkLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      color: theme.palette.accent,
    },
    form: {
      gap: 12,
      marginTop: 12,
    },
    input: {
      padding: 10,
      backgroundColor: theme.palette.surface3,
      borderRadius: 8,
      fontFamily: theme.fonts.sans,
      color: theme.palette.ink,
    },
    formActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    buttonLabel: {
      color: theme.palette.onAccent,
      fontFamily: theme.fonts.sans,
      fontWeight: "700",
    },
    cancelButton: {
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    cancelLabel: {
      fontFamily: theme.fonts.sans,
      color: theme.palette.ink3,
    },
    success: {
      fontFamily: theme.fonts.sans,
      color: theme.palette.accent,
      marginTop: 8,
    },
  })

export default Profile
