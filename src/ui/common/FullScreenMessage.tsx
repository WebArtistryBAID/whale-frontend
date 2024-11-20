import FullScreenDetail from './FullScreenDetail.tsx'

export default function FullScreenMessage({ title, description }: { title: string, description: string }): JSX.Element {
    return <FullScreenDetail title={title}>
        <p className="text-sm">
            {description}
        </p>
    </FullScreenDetail>
}
