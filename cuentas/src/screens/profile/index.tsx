import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import grafito from "../../theme"
import { Button } from "../../Components/Button"
import { ErrorBanner } from "../../Components"
import BottomTabBar from "../../Components/BottomTabBar"
import { useProfile, useTabBar } from "../../hooks"

const Profile = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const tabBar = useTabBar()
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
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity
          onPress={() => navigate("/profile/settings")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="settings-outline" size={24} color={grafito.ink} />
        </TouchableOpacity>
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
              <Button onPress={handleSaveProfile} loading={savingProfile} disabled={savingProfile}>
                <Text style={styles.buttonLabel}>Guardar</Text>
              </Button>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
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
              <Ionicons name="pencil-outline" size={16} color={grafito.accent} />
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
            color={grafito.ink3}
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

        {passwordSuccess ? <Text style={styles.success}>{passwordSuccess}</Text> : null}
      </View>

      <ErrorBanner message={loading ? "" : error} />

      {/* Spacer pushes the tab bar to the bottom — the fixed-height sections
          above don't fill the screen on their own. */}
      <View style={styles.spacer} />

      <BottomTabBar {...tabBar} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
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
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 22,
    color: grafito.ink,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
  },
  name: {
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
  },
  email: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.ink3,
    marginTop: 4,
  },
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  editLinkLabel: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.accent,
  },
  form: {
    gap: 12,
    marginTop: 12,
  },
  input: {
    padding: 10,
    backgroundColor: grafito.surface3,
    borderRadius: 8,
    fontFamily: grafito.fonts.sans,
    color: grafito.ink,
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  buttonLabel: {
    color: grafito.onAccent,
    fontFamily: grafito.fonts.sans,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cancelLabel: {
    fontFamily: grafito.fonts.sans,
    color: grafito.ink3,
  },
  success: {
    fontFamily: grafito.fonts.sans,
    color: grafito.accent,
    marginTop: 8,
  },
})

export default Profile
