with open('frontend/src/components/RightActionPane.tsx', 'rb') as f:
    data = f.read()

# Replace broken token
data = data.replace(b'{PERMIT-ECR-DNR-}', b'PERMIT-ECR-DNR-{event.id.replace(/^EVT[-_]/, "")}')

with open('frontend/src/components/RightActionPane.tsx', 'wb') as f:
    f.write(data)

print("Updated successfully")
