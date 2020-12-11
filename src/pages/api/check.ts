import { checkUrl } from '@app/fns/check'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send('')
    return
  }

  try {
    const result = await checkUrl(req.body.url)
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({})
  }
}
